// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from "../component/AdminNavbar.jsx";
import DashboardCard from "../component/DashboardCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Swal from "sweetalert2";

export default function Admin() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    projects: {
      count: 0,
      trend: { type: 'up', value: '+0%' },
      description: 'Total active projects',
      loading: true
    },
    vendors: {
      count: 0,
      trend: { type: 'up', value: '+0%' },
      description: 'Registered vendors',
      loading: true
    },
    items: {
      count: 0,
      trend: { type: 'up', value: '+0%' },
      description: 'Items in inventory',
      loading: true
    },
    users: {
      count: 0,
      trend: { type: 'up', value: '+0%' },
      description: 'Total system users',
      loading: true
    }
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Debug: cek token
  console.log("Admin - Current token:", token);

  // Check if user is authenticated
  useEffect(() => {
    if (!token) {
      console.warn('No token found, redirecting to login');
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  // Fetch stats from all endpoints
  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        console.log("Fetching vendors stats with token:", token); // Debug
        // Fetch vendors stats
        const vendorsResponse = await fetch('http://localhost:3002/api/vendors/stats/summary', {
          headers,
          credentials: 'include'
        });
        
        if (vendorsResponse.ok) {
          const vendorsData = await vendorsResponse.json();
          console.log("Vendors stats fetched:", vendorsData); // Debug
          setDashboardData(prev => ({
            ...prev,
            vendors: {
              count: vendorsData.totalVendors || vendorsData.data?.totalVendors || 0,
              trend: { 
                type: (vendorsData.growth || vendorsData.data?.growth || 0) >= 0 ? 'up' : 'down', 
                value: `${(vendorsData.growth || vendorsData.data?.growth || 0) >= 0 ? '+' : ''}${vendorsData.growth || vendorsData.data?.growth || 0}%` 
              },
              description: 'Registered vendors',
              loading: false
            }
          }));
        } else if (vendorsResponse.status === 401 || vendorsResponse.status === 403) {
          console.warn('Unauthorized access to vendors stats');
          Swal.fire("Error", "Unauthorized access to vendors data.", "error");
        }
      } catch (error) {
        console.error('Error fetching vendors stats:', error);
        setDashboardData(prev => ({
          ...prev,
          vendors: { ...prev.vendors, loading: false }
        }));
      }

      try {
        console.log("Fetching items stats with token:", token); // Debug
        // Fetch items stats
        const itemsResponse = await fetch('http://localhost:3003/api/items/stats/summary', {
          headers,
          credentials: 'include'
        });
        
        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json();
          console.log("Items stats fetched:", itemsData); // Debug
          setDashboardData(prev => ({
            ...prev,
            items: {
              count: itemsData.totalItems || itemsData.data?.totalItems || 0,
              trend: { 
                type: (itemsData.growth || itemsData.data?.growth || 0) >= 0 ? 'up' : 'down', 
                value: `${(itemsData.growth || itemsData.data?.growth || 0) >= 0 ? '+' : ''}${itemsData.growth || itemsData.data?.growth || 0}%` 
              },
              description: 'Items in inventory',
              loading: false
            }
          }));
        } else if (itemsResponse.status === 401 || itemsResponse.status === 403) {
          console.warn('Unauthorized access to items stats');
          Swal.fire("Error", "Unauthorized access to items data.", "error");
        }
      } catch (error) {
        console.error('Error fetching items stats:', error);
        setDashboardData(prev => ({
          ...prev,
          items: { ...prev.items, loading: false }
        }));
      }

      try {
        console.log("Fetching projects stats with token:", token); // Debug
        // Fetch projects stats
        const projectsResponse = await fetch('http://localhost:3004/api/projects/stats/summary', {
          headers,
          credentials: 'include'
        });
        
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          console.log("Projects stats fetched:", projectsData); // Debug
          setDashboardData(prev => ({
            ...prev,
            projects: {
              count: projectsData.totalProjects || projectsData.data?.totalProjects || 0,
              trend: { 
                type: (projectsData.growth || projectsData.data?.growth || 0) >= 0 ? 'up' : 'down', 
                value: `${(projectsData.growth || projectsData.data?.growth || 0) >= 0 ? '+' : ''}${projectsData.growth || projectsData.data?.growth || 0}%` 
              },
              description: 'Total active projects',
              loading: false
            }
          }));
        } else if (projectsResponse.status === 401 || projectsResponse.status === 403) {
          console.warn('Unauthorized access to projects stats');
          Swal.fire("Error", "Unauthorized access to projects data.", "error");
        }
      } catch (error) {
        console.error('Error fetching projects stats:', error);
        setDashboardData(prev => ({
          ...prev,
          projects: { ...prev.projects, loading: false }
        }));
      }

      try {
        console.log("Fetching auth stats with token:", token); // Debug
        // Fetch auth/users stats
        const authResponse = await fetch('http://localhost:5000/api/auth/stats', {
          headers,
          credentials: 'include'
        });
        
        if (authResponse.ok) {
          const authData = await authResponse.json();
          console.log("Auth stats fetched:", authData); // Debug
          setDashboardData(prev => ({
            ...prev,
            users: {
              count: authData.totalUsers || authData.data?.totalUsers || 0,
              trend: { 
                type: (authData.growth || authData.data?.growth || 0) >= 0 ? 'up' : 'down', 
                value: `${(authData.growth || authData.data?.growth || 0) >= 0 ? '+' : ''}${authData.growth || authData.data?.growth || 0}%` 
              },
              description: 'Total system users',
              loading: false
            }
          }));
        } else if (authResponse.status === 401 || authResponse.status === 403) {
          console.warn('Unauthorized access to auth stats');
          Swal.fire("Error", "Unauthorized access to user data.", "error");
        }
      } catch (error) {
        console.error('Error fetching auth stats:', error);
        setDashboardData(prev => ({
          ...prev,
          users: { ...prev.users, loading: false }
        }));
      }
    };

    fetchStats();
  }, [token]);

  // Fetch recent activity
  useEffect(() => {
    if (!token) return;

    const fetchRecentActivity = async () => {
      try {
        // You can implement endpoints for recent activities
        // For now, using dummy data
        setRecentActivity([
          {
            id: 1,
            message: "New project created",
            time: "2 hours ago",
            type: "project"
          },
          {
            id: 2,
            message: "New user registered",
            time: "4 hours ago",
            type: "user"
          },
          {
            id: 3,
            message: "Items added to inventory",
            time: "1 day ago",
            type: "item"
          }
        ]);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      }
    };

    fetchRecentActivity();
  }, [token]);

  // If no token, don't render anything (redirect will happen)
  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛠️ Admin Panel
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your system today.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Projects"
            count={dashboardData.projects.loading ? "..." : dashboardData.projects.count}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            color="blue"
            trend={dashboardData.projects.trend}
            description={dashboardData.projects.description}
          />

          <DashboardCard
            title="Vendors"
            count={dashboardData.vendors.loading ? "..." : dashboardData.vendors.count}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            color="green"
            trend={dashboardData.vendors.trend}
            description={dashboardData.vendors.description}
          />

          <DashboardCard
            title="Items"
            count={dashboardData.items.loading ? "..." : dashboardData.items.count}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            color="purple"
            trend={dashboardData.items.trend}
            description={dashboardData.items.description}
          />

          <DashboardCard
            title="Users"
            count={dashboardData.users.loading ? "..." : dashboardData.users.count}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            color="orange"
            trend={dashboardData.users.trend}
            description={dashboardData.users.description}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Add New Project</p>
                    <p className="text-sm text-gray-500">Create a new project entry</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-500">View and edit user accounts</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-500">Generate system reports</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'project' ? 'bg-blue-100' :
                    activity.type === 'user' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    <svg className={`w-3 h-3 ${
                      activity.type === 'project' ? 'text-blue-600' :
                      activity.type === 'user' ? 'text-green-600' :
                      'text-purple-600'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}