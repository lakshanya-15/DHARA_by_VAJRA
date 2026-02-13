import { ASSETS } from '../../services/mockData';
import { Users, Settings, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  // Mock users data
  const users = [
    { id: 1, name: 'Ramesh Singh', role: 'Operator', email: 'ramesh@example.com', joined: '2023-10-12' },
    { id: 2, name: 'Suresh Yadav', role: 'Farmer', email: 'suresh@example.com', joined: '2023-11-05' },
    { id: 3, name: 'Vijay Patil', role: 'Operator', email: 'vijay@example.com', joined: '2023-09-20' },
    { id: 4, name: 'Tech Farming Sol.', role: 'Operator', email: 'info@techfarming.com', joined: '2023-08-15' },
    { id: 5, name: 'Amit Kumar', role: 'Farmer', email: 'amit@example.com', joined: '2023-12-01' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-lg">
          <ShieldCheck className="text-indigo-600" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-gray-500">Platform Overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-full bg-blue-50 text-blue-600"><Users /></div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-2 rounded-full bg-white shadow-sm border border-green-100"><img src="/dhara_logo.png" alt="Logo" className="w-10 h-10 object-cover rounded-full" /></div>
          <div>
            <p className="text-sm text-gray-500">Total Assets</p>
            <h3 className="text-2xl font-bold text-gray-900">{ASSETS.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-full bg-orange-50 text-orange-600"><Settings /></div>
          <div>
            <p className="text-sm text-gray-500">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-gray-900">2</h3>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">User Registry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Email</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{user.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                      ${user.role === 'Operator'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{user.email}</td>
                  <td className="p-4 text-gray-500">{user.joined}</td>
                  <td className="p-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                    <span className="mx-2 text-gray-300">|</span>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">Ban</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
