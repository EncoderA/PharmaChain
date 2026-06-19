import { NextResponse } from "next/server";
import db from "@/db/index";
import {
  productsTable,
  transactionsTable,
  usersTable,
  supplyChainRelationsTable,
} from "@/db/schema";
import { eq, sql, count, or, and, gte, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { alias } from "drizzle-orm/pg-core";

function getTimeRangeDate(range: string) {
  const date = new Date();
  switch (range) {
    case "7days":
      date.setDate(date.getDate() - 7);
      break;
    case "30days":
      date.setDate(date.getDate() - 30);
      break;
    case "90days":
      date.setDate(date.getDate() - 90);
      break;
    case "1year":
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      date.setDate(date.getDate() - 30);
  }
  return date;
}

function getPreviousTimeRangeDate(range: string) {
  const date = new Date();
  switch (range) {
    case "7days":
      date.setDate(date.getDate() - 14);
      break;
    case "30days":
      date.setDate(date.getDate() - 60);
      break;
    case "90days":
      date.setDate(date.getDate() - 180);
      break;
    case "1year":
      date.setFullYear(date.getFullYear() - 2);
      break;
    default:
      date.setDate(date.getDate() - 60);
  }
  return date;
}

function generateDateKeys(range: string) {
  const result = [];
  const now = new Date();
  let numDays = 30;
  
  if (range === "7days") numDays = 7;
  if (range === "90days") numDays = 90;
  if (range === "1year") numDays = 365;

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
  }
  return result;
}

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "30days";

    const startDate = getTimeRangeDate(timeRange);
    const prevStartDate = getPreviousTimeRangeDate(timeRange);

    const dateKeys = generateDateKeys(timeRange);

    // Build role-specific product filter
    const productFilter =
      user.role === "admin"
        ? undefined
        : user.role === "manufacturer"
          ? eq(productsTable.manufacturerId, user.id)
          : eq(productsTable.currentOwnerId, user.id);

    // Build role-specific transaction filter
    const txFilter =
      user.role === "admin"
        ? undefined
        : or(
            eq(transactionsTable.fromUserId, user.id),
            eq(transactionsTable.toUserId, user.id),
          );

    // ================== STATUS DATA (Current Products) ==================
    // Query products with owner role to determine journey-completed count
    const statusCountsQuery = db
      .select({
        status: productsTable.status,
        ownerRole: usersTable.role,
        count: count(),
      })
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.currentOwnerId, usersTable.id));
    if (productFilter) statusCountsQuery.where(productFilter);
    const statusCounts = await statusCountsQuery.groupBy(productsTable.status, usersTable.role);

    const statusMap: Record<string, number> = {
      Verified: 0,
      Complete: 0,
      Expired: 0,
    };
    for (const row of statusCounts) {
      if (row.status === "Verified") {
        statusMap["Verified"] += row.count;
      }
      if (row.status === "Expired") {
        statusMap["Expired"] += row.count;
      }
      // Journey completed: sold to consumer OR currently owned by pharmacist
      if (row.status === "Sold" || row.ownerRole === "pharmacist") {
        statusMap["Complete"] += row.count;
      }
    }

    const statusData = [
      { name: "Verified", value: statusMap["Verified"], color: "#10b981" },
      { name: "Complete", value: statusMap["Complete"], color: "#3b82f6" },
      { name: "Expired", value: statusMap["Expired"], color: "#ef4444" },
    ];

    // ================== PERFORMANCE DATA (Product-based) ==================
    // Query products grouped by creation date, counting total, journey completed, and expired
    const prodPerfRows = await db
      .select({
        date: sql<string>`TO_CHAR(${productsTable.createdAt}, 'YYYY-MM-DD')`,
        status: productsTable.status,
        ownerRole: usersTable.role,
        count: count(),
      })
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.currentOwnerId, usersTable.id))
      .where(
        productFilter
          ? and(gte(productsTable.createdAt, startDate), productFilter)
          : gte(productsTable.createdAt, startDate)
      )
      .groupBy(
        sql`TO_CHAR(${productsTable.createdAt}, 'YYYY-MM-DD')`,
        productsTable.status,
        usersTable.role,
      );

    const perfMap = new Map<string, { totalProducts: number; journeyCompleted: number; expired: number }>();

    for (const row of prodPerfRows) {
      if (!perfMap.has(row.date)) {
        perfMap.set(row.date, { totalProducts: 0, journeyCompleted: 0, expired: 0 });
      }
      const p = perfMap.get(row.date)!;
      p.totalProducts += row.count;

      // Journey completed: sold to consumer OR currently owned by pharmacist
      if (row.status === "Sold" || row.ownerRole === "pharmacist") {
        p.journeyCompleted += row.count;
      }
      if (row.status === "Expired") {
        p.expired += row.count;
      }
    }

    // ================== TRANSACTION DATA ==================
    const txDateFilter = gte(transactionsTable.createdAt, startDate);
    const txWhereClause = txFilter ? and(txDateFilter, txFilter) : txDateFilter;

    const txRows = await db
      .select({
        date: sql<string>`TO_CHAR(${transactionsTable.createdAt}, 'YYYY-MM-DD')`,
        status: transactionsTable.status,
        count: count(),
      })
      .from(transactionsTable)
      .where(txWhereClause)
      .groupBy(sql`TO_CHAR(${transactionsTable.createdAt}, 'YYYY-MM-DD')`, transactionsTable.status);

    const transMap = new Map<string, { transactions: number; value: number }>();

    for (const row of txRows) {
      if (!transMap.has(row.date)) {
        transMap.set(row.date, { transactions: 0, value: 0 });
      }
      const t = transMap.get(row.date)!;
      t.transactions += row.count;
      t.value += row.count * 150;
    }

    let performanceData;
    let transactionData;

    // Grouping for larger ranges
    if (timeRange === "1year" || timeRange === "90days" || timeRange === "30days") {
       if (timeRange === "1year") {
         const monthMap = new Map<string, any>();
         for (const date of dateKeys) {
           const d = new Date(date);
           const m = d.toLocaleString('default', { month: 'short' });
           if (!monthMap.has(m)) monthMap.set(m, { month: m, totalProducts: 0, journeyCompleted: 0, expired: 0, transactions: 0, value: 0, date: m });
           
           const mm = monthMap.get(m)!;
           const p = perfMap.get(date);
           const t = transMap.get(date);
           if (p) {
             mm.totalProducts += p.totalProducts; mm.journeyCompleted += p.journeyCompleted; mm.expired += p.expired;
           }
           if (t) {
             mm.transactions += t.transactions; mm.value += t.value;
           }
         }
         const arr = Array.from(monthMap.values());
         performanceData = arr.map(a => ({ month: a.month, totalProducts: a.totalProducts, journeyCompleted: a.journeyCompleted, expired: a.expired }));
         transactionData = arr.map(a => ({ date: a.date, transactions: a.transactions, value: a.value }));
       } else if (timeRange === "90days" || timeRange === "30days") {
         // return daily
         performanceData = dateKeys.map(d => ({
            month: d, 
            totalProducts: perfMap.get(d)?.totalProducts || 0,
            journeyCompleted: perfMap.get(d)?.journeyCompleted || 0,
            expired: perfMap.get(d)?.expired || 0,
         }));
         transactionData = dateKeys.map(d => ({
            date: d,
            transactions: transMap.get(d)?.transactions || 0,
            value: transMap.get(d)?.value || 0,
         }));
       } else {
         // 7days
         performanceData = dateKeys.map(d => ({
            month: d, 
            totalProducts: perfMap.get(d)?.totalProducts || 0,
            journeyCompleted: perfMap.get(d)?.journeyCompleted || 0,
            expired: perfMap.get(d)?.expired || 0,
         }));
         transactionData = dateKeys.map(d => ({
            date: d,
            transactions: transMap.get(d)?.transactions || 0,
            value: transMap.get(d)?.value || 0,
         }));
       }
    } else {
      performanceData = dateKeys.map(d => ({
        month: d, 
        totalProducts: perfMap.get(d)?.totalProducts || 0,
        journeyCompleted: perfMap.get(d)?.journeyCompleted || 0,
        expired: perfMap.get(d)?.expired || 0,
     }));
     transactionData = dateKeys.map(d => ({
        date: d,
        transactions: transMap.get(d)?.transactions || 0,
        value: transMap.get(d)?.value || 0,
     }));
    }

    // ================== TOP PRODUCTS ==================
    // Top selling products for this user (products with most Confirmed transactions)
    const topProdBase = db
      .select({
        id: productsTable.productCode,
        name: productsTable.name,
        status: productsTable.status,
        sales: count(transactionsTable.id),
      })
      .from(productsTable)
      .leftJoin(transactionsTable, and(
        eq(productsTable.id, transactionsTable.productId),
        eq(transactionsTable.status, "Confirmed"),
        gte(transactionsTable.createdAt, startDate) // only recent sales
      ));
    
    if (productFilter) {
      topProdBase.where(productFilter);
    }
    
    const topProducts = await topProdBase
      .groupBy(productsTable.id)
      .orderBy(desc(count(transactionsTable.id)))
      .limit(5);

    // ================== METRICS ==================
    // We need current vs previous period to calculate % change
    const [currentTxCount] = await db.select({ count: count() }).from(transactionsTable).where(txWhereClause);
    
    const prevTxDateFilter = and(gte(transactionsTable.createdAt, prevStartDate), sql`${transactionsTable.createdAt} < ${startDate}`);
    const prevTxWhereClause = txFilter ? and(prevTxDateFilter, txFilter) : prevTxDateFilter;
    const [prevTxCount] = await db.select({ count: count() }).from(transactionsTable).where(prevTxWhereClause);

    // Products Verified (Created recently or status updated? We'll just count total verified products for simplicity 
    // or products verified within the timeframe. Let's filter products by createdAt for the metric.)
    const prodDateFilter = gte(productsTable.createdAt, startDate);
    const prodWhereClause = productFilter ? and(prodDateFilter, productFilter) : prodDateFilter;
    const [currentProdVerified] = await db.select({ count: count() }).from(productsTable).where(
      and(prodWhereClause, eq(productsTable.status, "Verified"))
    );
    
    const prevProdDateFilter = and(gte(productsTable.createdAt, prevStartDate), sql`${productsTable.createdAt} < ${startDate}`);
    const prevProdWhereClause = productFilter ? and(prevProdDateFilter, productFilter) : prevProdDateFilter;
    const [prevProdVerified] = await db.select({ count: count() }).from(productsTable).where(
      and(prevProdWhereClause, eq(productsTable.status, "Verified"))
    );

    // Expired products
    const [currentExpired] = await db.select({ count: count() }).from(productsTable).where(
      and(prodWhereClause, eq(productsTable.status, "Expired"))
    );
    const [prevExpired] = await db.select({ count: count() }).from(productsTable).where(
      and(prevProdWhereClause, eq(productsTable.status, "Expired"))
    );

    // Journey completed: products that reached the end of the supply chain
    // Either sold to a consumer (status = "Sold") or currently owned by a pharmacist
    const currentJourneyBase = db
      .select({ count: count() })
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.currentOwnerId, usersTable.id))
      .where(
        and(
          prodDateFilter,
          productFilter,
          or(
            eq(productsTable.status, "Sold"),
            eq(usersTable.role, "pharmacist"),
          ),
        )
      );
    const [currentJourney] = await currentJourneyBase;

    const prevJourneyBase = db
      .select({ count: count() })
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.currentOwnerId, usersTable.id))
      .where(
        and(
          prevProdDateFilter,
          productFilter,
          or(
            eq(productsTable.status, "Sold"),
            eq(usersTable.role, "pharmacist"),
          ),
        )
      );
    const [prevJourney] = await prevJourneyBase;

    const calcChange = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? "+100%" : "0%";
      const pct = ((current - prev) / prev) * 100;
      return (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%";
    };

    const metrics = [
      {
        title: "Total Transactions",
        value: currentTxCount.count.toString(),
        change: calcChange(currentTxCount.count, prevTxCount.count),
        icon: "Zap",
        color: "text-blue-500",
      },
      {
        title: "Products Verified",
        value: currentProdVerified.count.toString(),
        change: calcChange(currentProdVerified.count, prevProdVerified.count),
        icon: "CheckCircle",
        color: "text-green-500",
      },
      {
        title: "Expired",
        value: currentExpired.count.toString(),
        change: calcChange(currentExpired.count, prevExpired.count),
        icon: "Clock",
        color: "text-orange-500",
      },
      {
        title: "Journey Completed",
        value: currentJourney.count.toString(),
        change: calcChange(currentJourney.count, prevJourney.count),
        icon: "Package",
        color: "text-purple-500",
      },
    ];

    // ================== PARTNERS DATA ==================
    // Product-based partner performance: totalProducts, completed, expired per partner
    // Find partners by looking at transactions where this user received products
    const fromUserAlias = alias(usersTable, "from_user");
    const ownerAlias = alias(usersTable, "owner_user");

    if (user.role === "admin") {
      // Admin: show per-manufacturer product stats
      const adminPartnersRows = await db
        .select({
          partner: usersTable.fullName,
          status: productsTable.status,
          ownerRole: ownerAlias.role,
          count: count(),
        })
        .from(productsTable)
        .innerJoin(usersTable, eq(productsTable.manufacturerId, usersTable.id))
        .leftJoin(ownerAlias, eq(productsTable.currentOwnerId, ownerAlias.id))
        .where(gte(productsTable.createdAt, startDate))
        .groupBy(usersTable.fullName, productsTable.status, ownerAlias.role);

      const pMap = new Map<string, { totalProducts: number; completed: number; expired: number }>();
      for (const r of adminPartnersRows) {
        if (!pMap.has(r.partner)) pMap.set(r.partner, { totalProducts: 0, completed: 0, expired: 0 });
        const pm = pMap.get(r.partner)!;
        pm.totalProducts += r.count;
        if (r.status === "Sold" || r.ownerRole === "pharmacist") pm.completed += r.count;
        if (r.status === "Expired") pm.expired += r.count;
      }

      var partnersData = Array.from(pMap.entries()).map(([partner, data]) => ({
        partner,
        totalProducts: data.totalProducts,
        completed: data.completed,
        expired: data.expired,
      })).slice(0, 5);
    } else {
      // Non-admin: show the user's own performance stats
      // Manufacturer: products they manufactured
      // Distributor/Wholesaler: products they currently own or have handled
      const ownProductFilter =
        user.role === "manufacturer"
          ? eq(productsTable.manufacturerId, user.id)
          : eq(productsTable.currentOwnerId, user.id);

      const ownPerfRows = await db
        .select({
          status: productsTable.status,
          ownerRole: ownerAlias.role,
          count: count(),
        })
        .from(productsTable)
        .leftJoin(ownerAlias, eq(productsTable.currentOwnerId, ownerAlias.id))
        .where(
          and(
            gte(productsTable.createdAt, startDate),
            ownProductFilter,
          )
        )
        .groupBy(productsTable.status, ownerAlias.role);

      let ownTotal = 0, ownCompleted = 0, ownExpired = 0;
      for (const r of ownPerfRows) {
        ownTotal += r.count;
        if (r.status === "Sold" || r.ownerRole === "pharmacist") ownCompleted += r.count;
        if (r.status === "Expired") ownExpired += r.count;
      }

      var partnersData = [{
        partner: user.fullName,
        totalProducts: ownTotal,
        completed: ownCompleted,
        expired: ownExpired,
      }];
    }

    // If partnersData is empty (e.g., admin or leaf node), we can provide a default or leave it empty.
    
    // Summary values
    // For on-time delivery rate, use failed transactions count
    const [currentFailedTx] = await db.select({ count: count() }).from(transactionsTable).where(
      and(txWhereClause, eq(transactionsTable.status, "Failed"))
    );
    const [prevFailedTx] = await db.select({ count: count() }).from(transactionsTable).where(
      and(prevTxWhereClause, eq(transactionsTable.status, "Failed"))
    );

    const onTimeDeliveryRate = currentTxCount.count > 0 
      ? Math.round(((currentTxCount.count - currentFailedTx.count) / currentTxCount.count) * 100 * 10) / 10 
      : 100;

    const prevOnTimeDeliveryRate = prevTxCount.count > 0 
      ? Math.round(((prevTxCount.count - prevFailedTx.count) / prevTxCount.count) * 100 * 10) / 10 
      : 100;
    
    const summary = {
      avgProcessingTime: "1.2 days", // Mocked as we don't track time between statuses easily yet
      avgProcessingTimeChange: "-5%",
      onTimeDeliveryRate: `${onTimeDeliveryRate}%`,
      onTimeDeliveryRateChange: calcChange(onTimeDeliveryRate, prevOnTimeDeliveryRate),
      blockchainVerificationRate: "100%", // Assuming all confirmed are on chain
      blockchainVerificationRateChange: "0%",
    };

    return NextResponse.json({
      performanceData,
      statusData,
      transactionData,
      topProducts,
      metrics,
      partnersData,
      summary,
      userRole: user.role,
    });
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports data" },
      { status: 500 },
    );
  }
}
