import requests
import sys
import json
from datetime import datetime

class RadarClientesAPITester:
    def __init__(self, base_url="https://clientradar-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.business_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_register_user(self):
        """Test user registration"""
        test_user_data = {
            "name": f"Teste User {datetime.now().strftime('%H%M%S')}",
            "email": f"teste{datetime.now().strftime('%H%M%S')}@teste.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_login_existing_user(self):
        """Test login with existing user"""
        login_data = {
            "email": "teste@teste.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Login Existing User",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_get_user_profile(self):
        """Test getting user profile"""
        return self.run_test("Get User Profile", "GET", "auth/me", 200)

    def test_create_business(self):
        """Test business creation"""
        business_data = {
            "name": "Teste Negócio",
            "niche": "Consultoria",
            "description": "Negócio de teste para API",
            "city": "São Paulo",
            "state": "SP"
        }
        
        success, response = self.run_test(
            "Create Business",
            "POST",
            "business",
            200,
            data=business_data
        )
        
        if success and 'id' in response:
            self.business_id = response['id']
            print(f"   Business ID: {self.business_id}")
            return True
        return False

    def test_get_business(self):
        """Test getting business info"""
        return self.run_test("Get Business", "GET", "business", 200)

    def test_create_lead(self):
        """Test lead creation"""
        lead_data = {
            "name": "João Silva",
            "email": "joao@teste.com",
            "phone": "(11) 99999-9999",
            "interest": "Consultoria empresarial",
            "source": "manual"
        }
        
        return self.run_test("Create Lead", "POST", "leads", 200, data=lead_data)

    def test_get_leads(self):
        """Test getting leads list"""
        return self.run_test("Get Leads", "GET", "leads", 200)

    def test_create_landing_page(self):
        """Test landing page creation"""
        page_data = {
            "title": "Página de Teste",
            "headline": "Transforme seu negócio hoje!",
            "description": "Descubra como nossa consultoria pode ajudar",
            "offer": "Consultoria gratuita de 30 minutos",
            "cta_text": "Quero minha consultoria"
        }
        
        return self.run_test("Create Landing Page", "POST", "landing-pages", 200, data=page_data)

    def test_get_landing_pages(self):
        """Test getting landing pages"""
        return self.run_test("Get Landing Pages", "GET", "landing-pages", 200)

    def test_market_insights(self):
        """Test market insights generation"""
        insight_data = {
            "niche": "Consultoria",
            "city": "São Paulo",
            "type": "trends"
        }
        
        print("   ⏳ Generating AI insights (may take a few seconds)...")
        return self.run_test("Market Insights", "POST", "insights/market", 200, data=insight_data)

    def test_strategy_generation(self):
        """Test strategy generation"""
        strategy_data = {
            "niche": "Consultoria",
            "insight_type": "campaign"
        }
        
        print("   ⏳ Generating AI strategy (may take a few seconds)...")
        return self.run_test("Strategy Generation", "POST", "insights/strategy", 200, data=strategy_data)

    def test_dashboard_data(self):
        """Test dashboard data retrieval"""
        return self.run_test("Dashboard Data", "GET", "reports/dashboard", 200)

    def test_generate_report(self):
        """Test report generation"""
        report_data = {
            "period": "weekly"
        }
        
        print("   ⏳ Generating AI report (may take a few seconds)...")
        return self.run_test("Generate Report", "POST", "reports/generate", 200, data=report_data)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Radar de Clientes API Tests")
        print(f"   Base URL: {self.base_url}")
        print("=" * 60)

        # Basic health check
        self.test_health_check()

        # Try login with existing user first
        if not self.test_login_existing_user():
            # If login fails, register new user
            if not self.test_register_user():
                print("❌ Cannot proceed without authentication")
                return False

        # Test authenticated endpoints
        self.test_get_user_profile()
        
        # Business tests
        if not self.test_create_business():
            # Try to get existing business
            self.test_get_business()
        else:
            self.test_get_business()

        # Lead management tests
        self.test_create_lead()
        self.test_get_leads()

        # Landing page tests
        self.test_create_landing_page()
        self.test_get_landing_pages()

        # AI features tests (may be slower)
        self.test_market_insights()
        self.test_strategy_generation()

        # Dashboard and reports
        self.test_dashboard_data()
        self.test_generate_report()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = RadarClientesAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())