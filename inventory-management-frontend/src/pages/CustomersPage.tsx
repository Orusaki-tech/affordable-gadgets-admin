import React from 'react';

export const CustomersPage: React.FC = () => {

  // Note: There's no list endpoint for customers, so we'll show a placeholder
  // In a real scenario, you might want to add a backend endpoint to list all customers

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Customers</h1>
      </div>

      <div className="info-card">
        <h2>Customer Management</h2>
        <div className="info-text">
          <p>
            Customer management features are currently limited. To view and manage customers,
            you would need backend endpoints that list all customer profiles.
          </p>
          <p>
            Currently available endpoints:
          </p>
          <ul>
            <li>
              <strong>GET /profiles/customer/</strong> - Get authenticated customer's own profile
            </li>
            <li>
              <strong>PUT /profiles/customer/</strong> - Update authenticated customer's profile
            </li>
          </ul>
          <p>
            To add full customer management (list, view, edit all customers), you would need:
          </p>
          <ul>
            <li>A CustomerViewSet with list/retrieve/update endpoints</li>
            <li>Admin-only permissions for viewing all customers</li>
            <li>Filtering and search capabilities</li>
          </ul>
        </div>
      </div>

      <div className="info-card">
        <h2>Future Features</h2>
        <div className="info-text">
          <p>When customer management endpoints are added, this page will include:</p>
          <ul>
            <li>List of all registered customers</li>
            <li>Search and filter functionality</li>
            <li>View customer details (profile, orders, reviews)</li>
            <li>Edit customer information (admin only)</li>
            <li>Customer activity history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

