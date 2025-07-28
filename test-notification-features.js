const axios = require('axios');

const API_BASE_URL = 'http://localhost:1412/API';

// Test user credentials (you should have these in your system)
const testUser = {
  username: 'testuser',
  password: 'password123'
};

const testAdmin = {
  username: 'admin',
  password: 'admin123'
};

async function testNotificationFeatures() {
  console.log('🧪 Testing Notification System Features...\n');
  
  try {
    // Test 1: User login and get user ID
    console.log('1. Testing user authentication...');
    const userLoginResponse = await axios.post(`${API_BASE_URL}/login`, testUser);
    const userId = userLoginResponse.data.user._id;
    console.log('✅ User authenticated:', userLoginResponse.data.user.username);
    console.log('   User ID:', userId);
    
    // Test 2: Admin login and get admin ID
    console.log('\\n2. Testing admin authentication...');
    const adminLoginResponse = await axios.post(`${API_BASE_URL}/login`, testAdmin);
    const adminId = adminLoginResponse.data.user._id;
    console.log('✅ Admin authenticated:', adminLoginResponse.data.user.username);
    console.log('   Admin ID:', adminId);
    
    // Test 3: Get user notifications (should work)
    console.log('\\n3. Testing user notifications endpoint...');
    try {
      const userNotificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { 'x-user-id': userId }
      });
      console.log('✅ User notifications retrieved successfully');
      console.log('   Count:', userNotificationsResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ User notifications failed:', error.response?.data?.error || error.message);
    }\n    \n    // Test 4: Get admin notifications (should work for admin)\n    console.log('\\n4. Testing admin notifications endpoint...');\n    try {\n      const adminNotificationsResponse = await axios.get(`${API_BASE_URL}/admin/notifications`, {\n        headers: { 'x-user-id': adminId }\n      });\n      console.log('✅ Admin notifications retrieved successfully');\n      console.log('   Count:', adminNotificationsResponse.data.data?.length || 0);\n    } catch (error) {\n      console.log('❌ Admin notifications failed:', error.response?.data?.error || error.message);\n    }\n    \n    // Test 5: Try admin notifications with regular user (should fail)\n    console.log('\\n5. Testing admin notifications with regular user (should fail)...');\n    try {\n      await axios.get(`${API_BASE_URL}/admin/notifications`, {\n        headers: { 'x-user-id': userId }\n      });\n      console.log('❌ This should have failed - security issue!');\n    } catch (error) {\n      if (error.response?.status === 403) {\n        console.log('✅ Correctly blocked regular user from admin notifications');\n      } else {\n        console.log('❌ Unexpected error:', error.response?.data?.error || error.message);\n      }\n    }\n    \n    // Test 6: Test mark all as read for user\n    console.log('\\n6. Testing mark all as read for user...');\n    try {\n      await axios.put(`${API_BASE_URL}/notifications/mark-all-read`, {}, {\n        headers: { 'x-user-id': userId }\n      });\n      console.log('✅ Mark all as read successful for user');\n    } catch (error) {\n      console.log('❌ Mark all as read failed:', error.response?.data?.error || error.message);\n    }\n    \n    // Test 7: Test clear all notifications for admin\n    console.log('\\n7. Testing clear all notifications for admin...');\n    try {\n      const clearResponse = await axios.delete(`${API_BASE_URL}/admin/notifications/clear-all`, {\n        headers: { 'x-user-id': adminId }\n      });\n      console.log('✅ Clear all notifications successful for admin');\n      console.log('   Deleted count:', clearResponse.data.deletedCount);\n    } catch (error) {\n      console.log('❌ Clear all notifications failed:', error.response?.data?.error || error.message);\n    }\n    \n    // Test 8: Try clear all with regular user (should fail)\n    console.log('\\n8. Testing clear all notifications with regular user (should fail)...');\n    try {\n      await axios.delete(`${API_BASE_URL}/admin/notifications/clear-all`, {\n        headers: { 'x-user-id': userId }\n      });\n      console.log('❌ This should have failed - security issue!');\n    } catch (error) {\n      if (error.response?.status === 403) {\n        console.log('✅ Correctly blocked regular user from clearing all notifications');\n      } else {\n        console.log('❌ Unexpected error:', error.response?.data?.error || error.message);\n      }\n    }\n    \n    console.log('\\n🎉 Notification system testing completed!');\n    \n  } catch (error) {\n    console.error('❌ Test failed:', error.message);\n    if (error.response) {\n      console.error('   Status:', error.response.status);\n      console.error('   Data:', error.response.data);\n    }\n  }\n}\n\n// Run the test\ntestNotificationFeatures();