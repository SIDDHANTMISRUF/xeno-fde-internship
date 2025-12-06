// apps/frontend/components/Dashboard/TopCustomers.tsx
import React from 'react';
import { User, DollarSign, ShoppingBag } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
}

interface TopCustomersProps {
  customers: Customer[];
}

const TopCustomers: React.FC<TopCustomersProps> = ({ customers }) => {
  // Sample data if none provided
  const displayCustomers = customers.length > 0 ? customers : [
    { id: '1', name: 'Emma Johnson', email: 'emma@example.com', totalSpent: 945.67, orderCount: 8 },
    { id: '2', name: 'Michael Chen', email: 'michael@example.com', totalSpent: 2345.89, orderCount: 15 },
    { id: '3', name: 'Sarah Williams', email: 'sarah@example.com', totalSpent: 189.99, orderCount: 3 },
    { id: '4', name: 'David Rodriguez', email: 'david@example.com', totalSpent: 1567.43, orderCount: 12 },
    { id: '5', name: 'Lisa Park', email: 'lisa@example.com', totalSpent: 432.10, orderCount: 5 },
  ];

  return (
    <div className="space-y-4">
      {displayCustomers.map((customer, index) => (
        <div 
          key={customer.id} 
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {index + 1}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{customer.name}</h3>
              <p className="text-sm text-gray-500">{customer.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-bold text-gray-900">
                  ${customer.totalSpent.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-gray-900">
                  {customer.orderCount}
                </span>
              </div>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopCustomers;