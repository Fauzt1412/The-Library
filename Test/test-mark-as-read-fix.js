const axios = require('axios');

const API_BASE_URL = 'http://localhost:1412/API';

// Test admin credentials
const testAdmin = {
  username: 'admin',
  password: 'admin123'
};

async function testMarkAsReadFix() {
  console.log('🧪 Testing Mark as Read Fix...\n');
  
  try {
    // Test 1: Admin login
    console.log('1. Testing admin authentication...');
    const adminLoginResponse = await axios.post(`${API_BASE_URL}/login`, testAdmin);
    const adminId = adminLoginResponse.data.user._id;
    console.log('✅ Admin authenticated:', adminLoginResponse.data.user.username);
    console.log('   Admin ID:', adminId);
    
    // Test 2: Get admin notifications to find one to mark as read
    console.log('\\n2. Getting admin notifications...');
    const notificationsResponse = await axios.get(`${API_BASE_URL}/admin/notifications`, {
      headers: { 'x-user-id': adminId }
    });
    
    const notifications = notificationsResponse.data.data || [];
    console.log('✅ Retrieved notifications:', notifications.length);
    
    if (notifications.length === 0) {
      console.log('ℹ️  No notifications to test with. Creating a test scenario...');
      
      // We could create a test notification here, but for now let's just test the endpoint structure
      console.log('\\n3. Testing mark as read endpoint structure...');
      
      // Test with a dummy ID to see if the authentication works
      try {
        await axios.put(
          `${API_BASE_URL}/notifications/507f1f77bcf86cd799439011/read`, // dummy ObjectId
          {},
          { 
            headers: { 
              'x-user-id': adminId,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ Authentication working! (Got 404 - notification not found, which is expected)');
          console.log('   This means the user ID was properly passed and authenticated');
        } else if (error.response?.status === 401 && error.response?.data?.error === 'User ID is required for this operation') {
          console.log('❌ Authentication still failing - user ID not being passed properly');
          console.log('   Error:', error.response.data.error);
        } else {
          console.log('🤔 Unexpected error:', error.response?.status, error.response?.data);
        }
      }
      
      return;
    }
    
    // Find an unread notification or use the first one
    const testNotification = notifications.find(n => !n.read) || notifications[0];
    
    console.log('\\n3. Testing mark as read with real notification...');
    console.log('   Notification ID:', testNotification._id);
    console.log('   Currently Read:', testNotification.read);
    
    // Test 3: Mark notification as read
    try {
      const markReadResponse = await axios.put(
        `${API_BASE_URL}/notifications/${testNotification._id}/read`,
        {},
        { 
          headers: { 
            'x-user-id': adminId,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Mark as read successful!');
      console.log('   Response:', markReadResponse.data.message);
      
      // Test 4: Verify it was marked as read
      console.log('\\n4. Verifying notification was marked as read...');
      const verifyResponse = await axios.get(`${API_BASE_URL}/admin/notifications`, {
        headers: { 'x-user-id': adminId }
      });
      
      const updatedNotifications = verifyResponse.data.data || [];
      const updatedNotification = updatedNotifications.find(n => n._id === testNotification._id);
      
      if (updatedNotification && updatedNotification.read) {
        console.log('✅ Notification successfully marked as read!');
        console.log('   Updated read status:', updatedNotification.read);
      } else {
        console.log('❌ Notification was not marked as read');
        console.log('   Updated notification read status:', updatedNotification?.read);
      }
      
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.error === 'User ID is required for this operation') {
        console.log('❌ Mark as read still failing - user ID not being passed properly');
        console.log('   Error:', error.response.data.error);
        console.log('   Request headers:', error.config.headers);
      } else {
        console.log('❌ Mark as read failed with different error:', error.response?.data?.error || error.message);
        console.log('   Status:', error.response?.status);
      }
    }
    
    console.log('\\n🎉 Mark as read testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testMarkAsReadFix();