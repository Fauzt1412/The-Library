const axios = require('axios');

const API_BASE_URL = 'http://localhost:1412/API';

// Test admin credentials
const testAdmin = {
  username: 'admin',
  password: 'admin123'
};

async function testMarkAsRead() {
  console.log('🧪 Testing Mark as Read Functionality...\n');
  
  try {
    // Test 1: Admin login
    console.log('1. Testing admin authentication...');
    const adminLoginResponse = await axios.post(`${API_BASE_URL}/login`, testAdmin);
    const adminId = adminLoginResponse.data.user._id;
    console.log('✅ Admin authenticated:', adminLoginResponse.data.user.username);
    console.log('   Admin ID:', adminId);
    
    // Test 2: Get admin notifications
    console.log('\\n2. Getting admin notifications...');
    const notificationsResponse = await axios.get(`${API_BASE_URL}/admin/notifications`, {
      headers: { 'x-user-id': adminId }
    });
    
    const notifications = notificationsResponse.data.data || [];
    console.log('✅ Retrieved notifications:', notifications.length);
    
    if (notifications.length === 0) {
      console.log('ℹ️  No notifications to test with');
      return;
    }
    
    // Find an unread notification
    const unreadNotification = notifications.find(n => !n.read);
    if (!unreadNotification) {
      console.log('ℹ️  No unread notifications to test with');
      console.log('   All notifications are already read');
      return;
    }
    
    console.log('\\n3. Testing mark as read...');
    console.log('   Notification ID:', unreadNotification._id);
    console.log('   Notification Title:', unreadNotification.title);
    console.log('   Currently Read:', unreadNotification.read);
    
    // Test 3: Mark notification as read
    try {
      const markReadResponse = await axios.put(
        `${API_BASE_URL}/notifications/${unreadNotification._id}/read`,
        {},
        { headers: { 'x-user-id': adminId } }
      );
      console.log('✅ Mark as read successful:', markReadResponse.data.message);
      
      // Test 4: Verify it was marked as read
      console.log('\\n4. Verifying notification was marked as read...');
      const verifyResponse = await axios.get(`${API_BASE_URL}/admin/notifications`, {
        headers: { 'x-user-id': adminId }
      });
      
      const updatedNotifications = verifyResponse.data.data || [];
      const updatedNotification = updatedNotifications.find(n => n._id === unreadNotification._id);
      
      if (updatedNotification && updatedNotification.read) {
        console.log('✅ Notification successfully marked as read');
      } else {
        console.log('❌ Notification was not marked as read');
        console.log('   Updated notification read status:', updatedNotification?.read);
      }
      
    } catch (error) {
      console.log('❌ Mark as read failed:', error.response?.data?.error || error.message);
      console.log('   Status:', error.response?.status);
      console.log('   Request URL:', `${API_BASE_URL}/notifications/${unreadNotification._id}/read`);
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
testMarkAsRead();