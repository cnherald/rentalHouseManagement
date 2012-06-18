import os
import simplejson
import django.utils.simplejson as json
from google.appengine.ext import db
from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
 
from datetime import datetime

from models import Payment
from models import Tenant
from models import Room
from models import Activity

#from models import TenantHistory

class MainPage(webapp.RequestHandler):    
    def get(self):
        #previous_url = self.request.get('previous_url')
        tenants = Tenant().getCurrentTenants()              
        clearedTenants = []
        pendingTenants = []      
        for tenant in tenants:
            if tenant.room: #displays only checked in tenant                 
                if tenant.paymentIsClear():
                    clearedTenants.append(tenant)                
                else:
                    pendingTenants.append(tenant)  
        path = os.path.join(os.path.dirname(__file__), 'mainPage.html')
        template_values = {'pendingTenants':pendingTenants, 'clearedTenants':clearedTenants,'previous_url':previous_url}
        self.response.out.write(template.render(path, template_values))

class Bootstrapmainpage(webapp.RequestHandler):
    def get(self):
        previous_url = self.request.get('previous_url')
        tenants = Tenant().getCurrentTenants()              
        clearedTenants = []
        pendingTenants = []
        for tenant in tenants:
            if tenant.room: #displays only checked in tenant                 
                if tenant.paymentIsClear():
                    clearedTenants.append(tenant)                
                else:
                    pendingTenants.append(tenant)
        path = os.path.join(os.path.dirname(__file__),"bootstrapmainpage.html")
        template_values = {'pendingTenants':pendingTenants, 'clearedTenants':clearedTenants,'previous_url':previous_url}
        self.response.out.write(template.render(path, template_values))
       
class TenantHandler(webapp.RequestHandler):
    roomNotAvailable = False
    def get(self):
        tenants = Tenant().getCurrentTenants()
        rooms = Room.all().get()
        path = os.path.join(os.path.dirname(__file__), 'tenants.html')
     
        if rooms:
            template_values = {'tenants':tenants} 
        else:                 
            roomNotAvailable = True
            template_values = {'tenants':tenants, 'roomNotAvailable':roomNotAvailable}                       

        self.response.out.write(template.render(path, template_values))            


class TenantRegisterHandler(webapp.RequestHandler):
    def post(self):
        self.response.headers['Content-Type'] = 'application/json'
        jsonString = self.request.body          
        data = simplejson.loads(jsonString) #Decoding JSON  
        tenant = Tenant().registerTenant(data)
        tenant.createRegisterActivityRecord()
        tenantRegisterResponse = {'tenantRegisterMsg':'Congratulations, you have successfully registered a new tenant!'}
        jsonResponse = simplejson.dumps(tenantRegisterResponse)
        return self.response.out.write(jsonResponse)

class RoomHandler(webapp.RequestHandler):
    def get(self):
        rooms = db.GqlQuery("SELECT *"
                            "FROM Room")

        path = os.path.join(os.path.dirname(__file__), 'rooms.html')         
        template_values = {'rooms':rooms}
        self.response.out.write(template.render(path, template_values)) 
    def post(self):
        room = Room()
        room.roomNumber = self.request.get('room_number')
        room.size = float(self.request.get('room_size'))
        room.rentSingle = float(self.request.get('room_rent_single'))
        room.rentDouble = float(self.request.get('room_rent_double'))
        #room.availability = self.request.get('room_availability')
        room.put()    
        room_url = '/rooms'
        self.redirect(room_url)    

class RoomRegisterHandler(webapp.RequestHandler):

    def post(self):
        self.response.headers['Content-Type'] = 'application/json'
        jsonString = self.request.body          
        data = simplejson.loads(jsonString) #Decoding JSON        
        room = Room(key_name = data['roomNumber'] )
        room.roomNumber = data['roomNumber']         
        room.size = float(data['roomSize'])
        room.rentSingle = float(data['rentSingle'])
        room.rentDouble = float(data['rentDouble'])
        room.put()    

        roomRegisterResponse = {'roomRegisterMsg':'Congratulations, you have successfully registered a new room!'}
        json = simplejson.dumps(roomRegisterResponse)
        return self.response.out.write(json)
          
class CheckinHandler(webapp.RequestHandler):
    def get(self):
        tenant_key = self.request.get('tenant_key')
        tenant = Tenant.get(tenant_key)
        room = Room()
        if room.notFull():            
            tenant_data_list = tenant.getTenantProfile()
            rooms_data_list = room.getAvailableRoomsProfile()
            data_list = []
            data_list.append({'tenantProfile': tenant_data_list, 'roomsProfile': rooms_data_list})
            output_json = json.dumps(data_list) 
            self.response.out.write(output_json)                              
        else:
            noVacancyResponse = {'noVacancyResponse':'Sorry, All rooms are occupied!'}
            noVacancyResponse_json = simplejson.dumps(noVacancyResponse)
            return self.response.out.write(noVacancyResponse_json) 
        
    def post(self):
        self.response.headers['Content-Type'] = 'application/json'
        jsonString = self.request.body       
        data = simplejson.loads(jsonString)
        tenant_key = data['tenantKey']
        tenant = Tenant.get(tenant_key)
        tenant.registerRoom(data)
        tenant.createCheckinActivityRecord()          
        checkinResponse = {'checkinSuccessMessage':'Congratulations, you have checked in the room!'}
        jsonCheckinResponse = simplejson.dumps(checkinResponse)
        return self.response.out.write(jsonCheckinResponse)

class CheckoutHandler(webapp.RequestHandler):
    
    def get(self):
        tenant_key = self.request.get('tenant_key')
        tenant = Tenant.get(tenant_key)
        checkout_data_list = tenant.getTenantCheckoutInfo()
        output_json = json.dumps(checkout_data_list) 
        self.response.out.write(output_json) 
    def delete(self):
        tenant_key = self.request.get('tenant_key')
        tenantToCheckout = Tenant.get(tenant_key) # tenant-key = tenant.key
        tenantToCheckout.createCheckoutActivityRecord()
        tenantToCheckout.unRegisterRoom()
        self.response.headers['Content-Type'] = 'application/json'
        response = {'checkoutSuccessNotice':'The tenant has checked out successfully!'}
        jsonResponse = simplejson.dumps(response)
        return self.response.out.write(jsonResponse)

class TenantHistoryHandler(webapp.RequestHandler):
    def get(self):
        #tenantHistory = TenantHistory()
        data_list = Tenant().getPreviousTenants()
        output_json = json.dumps(data_list)
        self.response.out.write(output_json) 
       
class TenantDeletionHandler(webapp.RequestHandler):
    def delete(self):
        self.response.headers['Content-Type'] = 'application/json'
        tenant_key = self.request.get('tenant_key')
        tenantToDelete = Tenant.get(tenant_key)
        if tenantToDelete.room:
            response = {'tenanIsNotCheckoutNotice':'Sorry you can not delete this tenant, please check out the tenant!'}
            jsonResponse = simplejson.dumps(response)
            return self.response.out.write(jsonResponse)
        else:
            tenantToDelete.removeActivity()
            #tenantToDelete.unRegisterRoom()
            db.delete(tenantToDelete)
            response = {'tenantDeletionSuccessNotice':'You have deleted the tenant successfully'}
            jsonResponse = simplejson.dumps(response)
            return self.response.out.write(jsonResponse)

class RoomDeletionHandler(webapp.RequestHandler):
    
        def delete(self):
            self.response.headers['Content-Type'] = 'application/json'
            room_key = self.request.get('room_key')
            roomToDelete = Room.get(room_key)
            rooms = db.GqlQuery("SELECT * "
                                "FROM Room")
            for room in rooms:
                if room.roomNumber == roomToDelete.roomNumber:
                    if room.tenant != None:
                        response = {'roomIsOccupiedNotice':'Please check out the tenant before delete the room!'}
                        jsonResponse = simplejson.dumps(response)
                        return self.response.out.write(jsonResponse)
                    else:
                        db.delete(room_key)
                        #self.response.headers['Content-Type'] = 'application/json'
                        response = {'roomDeletionSuccessNotice':'The room has been deleted successfully!'}
                        jsonResponse = simplejson.dumps(response)
                        return self.response.out.write(jsonResponse)

                                  
class PayRentHandler(webapp.RequestHandler):       
        def post(self):
            self.response.headers['Content-Type'] = 'application/json'
            jsonString = self.request.body       
            data = simplejson.loads(jsonString)
            tenant_key = data['tenant_key']                   
            tenant = Tenant.get(tenant_key)
            payAmount = tenant.updatePayment(data)
            tenant.createPayRentActivityRecord(payAmount)
            response = {'payRentSuccessNotice':'Congratulations, you have paid the rent!'}
            json_response= simplejson.dumps(response)
            return self.response.out.write(json_response)

class TenantProfileDataHandler(webapp.RequestHandler):
    def get(self):
        tenant_key = self.request.get('tenant_key')
        tenant = Tenant.get(tenant_key)
        data_list = tenant.getTenantProfile()
        output_json = json.dumps(data_list)
        self.response.out.write(output_json)        
       
class TenantProfileDataEditorHandler(webapp.RequestHandler):  
    def post(self):
        self.response.headers['Content-Type'] = 'application/json'
        jsonString = self.request.body          
        data = simplejson.loads(jsonString)
        
        tenant_key = data['tenant_Key']     
        #tenantToUpdate = Tenant.get_by_key_name(tenant_key, None)
        tenantToUpdate = Tenant.get(tenant_key)
        if (tenantToUpdate.updateTenantProfile(data)):      
            response = {'profileUpdatedMsg': "Congraduations, the tenant's profile has been updated successfully!"}
            response_json = simplejson.dumps(response)#Encoding JSON
            return self.response.out.write(response_json)
      
class RoomProfileDataHandler(webapp.RequestHandler):
    def get(self):
        room_key = self.request.get('room_key')
        room = Room.get(room_key)
        data_list = room.getRoomProfile()
        output_json = json.dumps(data_list)
        self.response.out.write(output_json) 

    def post(self):
        room_key = self.request.get('room_key')
        room = Room.get(room_key)
        room.roomNumber = self.request.get('room_number')    
        room.size = float(self.request.get('room_size'))
        room.rentSingle = float(self.request.get('room_rentSingle'))
        room.rentDouble = float(self.request.get('room_rentDouble'))
        room.put()
        roomProfile_url = '/rooms'
        self.redirect(roomProfile_url)

class RoomProfileDataEditorHandler(webapp.RequestHandler):
    def post(self):
        self.response.headers['Content-Type'] = 'application/json'
        jsonString = self.request.body          
        data = simplejson.loads(jsonString)       
        room_key = data['room_key']     
        roomToUpdate = Room.get(room_key)
        if (roomToUpdate .updateRoomProfile(data)):      
            response = {'profileUpdatedMsg': "Congraduations, the room's profile has been updated successfully!"}
            response_json = simplejson.dumps(response)#Encoding JSON
            return self.response.out.write(response_json)
  
        
class PaymentHistoryHandler(webapp.RequestHandler):
    def get(self):
        tenant_key = self.request.get('tenant_key')
        tenant = Tenant.get(tenant_key)
        data_list = tenant.getPaymentHistory()
        output_json = json.dumps(data_list)
        self.response.out.write(output_json)

        
class ShowActivityHandler(webapp.RequestHandler):
    def get(self):
        tenant_key = self.request.get('tenant_key')
        #tenant = Tenant().getTenant(tenant_key)
        tenant = Tenant.get(tenant_key)
        
        data_list = tenant.getTenantActivities()
        output_json = json.dumps(data_list)
        self.response.out.write(output_json) 
          
       
application = webapp.WSGIApplication([#('/', MainPage),
                                      ('/', MainPage),
                                      ('/payRent',PayRentHandler),
                                      #('/tenantProfile',TenantProfileHandler),
                                      ('/tenantProfileDataEditor',TenantProfileDataEditorHandler),
                                      ('/roomProfileDataEditor',RoomProfileDataEditorHandler),
                                      ('/paymentHistory',PaymentHistoryHandler),
                                      ('/tenantHistory',TenantHistoryHandler),
                                      ('/rooms',RoomHandler),
                                      ('/roomDeletion',RoomDeletionHandler),
                                      ('/roomProfileData',RoomProfileDataHandler), 
                                      #('/roomProfileEditor',RoomProfileEditorHandler),                                 
                                      #('/roomInfo',RoomInfoHandler),
                                      ('/tenantDeletion',TenantDeletionHandler),
                                      ('/tenantRegister',TenantRegisterHandler),
                                      ('/checkin',CheckinHandler),
                                      ('/checkout',CheckoutHandler),
                                      ('/roomRegister',RoomRegisterHandler),
                                      ('/showActivity',ShowActivityHandler),
                                      ('/tenantProfileData',TenantProfileDataHandler),                                   
                                      ('/tenants',TenantHandler)], debug=True)
                        
def main():
    run_wsgi_app(application)


if __name__ == "__main__":
    main()
