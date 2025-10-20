import React from 'react';

export default function SupplyChainDashboard() {
  const stats = [
    { label: 'Total Products', value: '1,250', change: '+12%' },
    { label: 'Transactions Processed', value: '5,800', change: '+8%' },
    { label: 'Active Supply Chains', value: '15', change: '+5%' }
  ];

  const chartData = [
    { month: 'Jan', height: '30%', opacity: 'bg-blue-500/20' },
    { month: 'Feb', height: '20%', opacity: 'bg-blue-500/20' },
    { month: 'Mar', height: '30%', opacity: 'bg-blue-500/20' },
    { month: 'Apr', height: '10%', opacity: 'bg-blue-500/20' },
    { month: 'May', height: '60%', opacity: 'bg-blue-500' },
    { month: 'Jun', height: '50%', opacity: 'bg-blue-500/60' },
    { month: 'Jul', height: '10%', opacity: 'bg-blue-500/20' }
  ];

  const activities = [
    { icon: 'add', title: 'Product Added', detail: 'Product ID: 12345', color: 'bg-blue-500/20 text-blue-500' },
    { icon: 'local_shipping', title: 'Shipped from Warehouse', detail: 'Tracking ID: ABCDE', color: 'bg-blue-500/20 text-blue-500' },
    { icon: 'warehouse', title: 'Received at Dist. Center', detail: 'Received at 10:00 AM', color: 'bg-blue-500/20 text-blue-500' },
    { icon: 'check', title: 'Quality Check Passed', detail: 'Passed at 2:00 PM', color: 'bg-green-500/20 text-green-500' },
    { icon: 'storefront', title: 'Delivered to Retailer', detail: 'Delivered at 5:00 PM', color: 'bg-blue-500/20 text-blue-500', isLast: true }
  ];

  return (
    <main className="flex-1 bg-background min-h-screen">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview of your supply chain activities.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors">
            <span className="material-symbols-outlined text-muted-foreground">notifications</span>
          </button>
          <div 
            className="w-10 h-10 rounded-full bg-cover bg-center" 
            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAGnDmbPB4fqLkyv8TAC8Fe6Ek2d6lIsjhKs6j8smfyQrDcTAUazFEZDaawxScS6Cig7M8Z3b1CSFsmRGiM5bzO2IwTPSMaAH_pAP-AFiGwe6AbbukfA_i19zFXdctlkhV7t9ZLBBs10b3VxWXmy7vj-AMSKVnjNSAP4kzg8vcR9p982sThZU7Qt7499l9T_MroI6n8ZVRjBqaG6A4jxq0ixy1V0zU0jQXzAY6k4wMemmqwl8VOfBRVgNHmlJZLJB7I6DMFtkDJZVU")'}}
          />
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Action Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <button className="bg-primary text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined">add_circle</span>
            <span>Add Product</span>
          </button>
          <button className="bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-secondary/80 transition-colors">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            <span>Track Product</span>
          </button>
          <button className="bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-secondary/80 transition-colors">
            <span className="material-symbols-outlined">verified_user</span>
            <span>Verify Authenticity</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card p-6 rounded-xl border border-border">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-sm font-medium text-green-500 mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Chart and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Summary Chart */}
          <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-1">Transaction Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">Last 30 Days</p>
            <div className="h-64 flex items-end gap-4">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 w-full h-full">
                  <div className="w-full h-full flex items-end">
                    <div className={`${data.opacity} w-full rounded-t-lg transition-all`} style={{height: data.height}} />
                  </div>
                  <p className="text-xs text-muted-foreground">{data.month}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Supply Chain Activity */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Supply Chain Activity</h3>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-base">{activity.icon}</span>
                    </div>
                    {!activity.isLast && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}