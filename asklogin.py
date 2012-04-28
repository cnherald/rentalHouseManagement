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
        #tenants_query = Tenant.all()
        #tenants = tenants_query.fetch(10)
        previous_url = self.request.get('previous_url')
        #tenants = db.GqlQuery("SELECT * "
                        #"FROM Tenant")
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
        
class TenantHandler(webapp.RequestHandler):
    roomNotAvailable = False
    def get(self):

        # tenants = db.GqlQuery("SELECT * "
        #                      "FROM Tenant")
        tenants = Tenant().getCurrentTenants()
        #rooms = db.GqlQuery("SELECT * "
        #                  "FROM Room")
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
    '''def get(self):
        rooms = db.GqlQuery("SELECT *"
                            "FROM Room")
        #rooms_query = Room.all()
        #rooms = rooms_query.fetch(10)
        path = os.path.join(os.path.dirname(__file__), 'roomRegister.html')         
        template_values = {'rooms':rooms}
        self.response.out.write(template.render(path, template_values)) '''
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
        '''room_key = data['room_key']       
        room = Room.get(room_key)
        room.rentActual = float(data['actualRent'])                                  
        tenant.room = room
        tenant.payPeriod = int(data['payPeriod'])       
        startDate = datetime.strptime(data['startDate'],"%Y-%m-%d")
        tenant.startDate = startDate.date()
        tenant.expiryDate = startDate.date()
        tenant.put()
        room.tenant = tenant
        room.put() '''
        tenant.createCheckinActivityRecord()          
        '''activity = Activity(key_name = "Act_Checkin_" + str(tenant.key()) +'_' + str(room.roomNumber))
        #activity.tenant = tenant
        activity.activityDate = datetime.now().replace(microsecond=0)
        activity.activityTitle = "Tenant_Checkin"
        activity.put()'''
        checkinResponse = {'checkinSuccessMessage':'Congratulations, you have checked in the room!'}
        jsonCheckinResponse = simplejson.dumps(checkinResponse)
        return self.response.out.write(jsonCheckinResponse)

class CheckoutHandler(webapp.RequestHandler):
    
    def get(self):
        tenant_key = self.request.get('tenant_key')
        tenant = Tenant.get(tenant_key)
        #tenant.livingPeriod = tenant.getLivingPeriod()
        #tenant.put()
        checkout_data_list = tenant.getTenantCheckoutInfo()
        output_json = json.dumps(checkout_data_list) 
        self.response.out.write(output_json) 
          
        ''' template_values = {'tenant': tenant}
        path = os.path.join(os.path.dirname(__file__), 'checkout.html') 
        self.response.out.write(template.render(path, template_values)) '''
    def delete(self):
        tenant_key = self.request.get('tenant_key')
        tenantToCheckout = Tenant.get(tenant_key) # tenant-key = tenant.key
        #tenantToCheckout = Tenant.get_by_key_name(tenant_key, None)
        #tenantHistory = TenantHistory(key_name = tenantToCheckout.firstName + '_' + tenantToCheckout.surname + '_' + str(tenantToCheckout.key()))
        #tenantHistory.put()
        #tenantToCheckout.tenantHistory = tenantHistory
        #tenantToCheckout.put()
        
        tenantToCheckout.createCheckoutActivityRecord()
        #tenantToCheckout.saveToHistory()

        #tenantToCheckout.clearPaymentRecord()
        tenantToCheckout.unRegisterRoom()
        #tenantToCheckout.removeActivity()
        self.response.headers['Content-Type'] = 'application/json'
        response = {'checkoutSuccessNotice':'The tenant has checked out successfully!'}
        jsonResponse = simplejson.dumps(response)
        return self.response.out.write(jsonResponse)
        #self.response.out.write('ok');
        
           
class TenantHistoryHandler(webapp.RequestHandler):
    def get(self):
        #tenantHistory = TenantHistory()
        data_list = Tenant().getPreviousTenants()
        output_json = json.dumps(data_list)
        self.response.out.write(output_json) 
        
        
        '''tenantHistory = db.GqlQuery("SELECT * "
                                    "FROM TenantHistory")
        path = os.path.join(os.path.dirname(__file__), 'tenantHistory.html')         
        #template_values = {'tenants':tenants}
        template_values = {'tenantHistory':tenantHistory}
        self.response.out.write(template.render(path, template_values))'''
    
  
        
class TenantDeletionHandler(webapp.RequestHandler):
    def delete(self):
        self.response.headers['Content-Type'] = 'application/json'
        tenant_key = self.request.get('tenant_key')
        #tenantToDelete = Tenant.get(tenant_key) # tenant-key = tenant.key
        #tenantToDelete = Tenant.get_by_key_name(tenant_key, None)
        tenantToDelete = Tenant.get(tenant_key)
        if tenantToDelete.room:
            response = {'tenanIsNotCheckoutNotice':'Please check out the tenant before delete the tenant!'}
            jsonResponse = simplejson.dumps(response)
            return self.response.out.write(jsonResponse)
        else:
            tenantToDelete.removeActivity()
            tenantToDelete.unRegisterRoom()
            response = {'tenantDeletionSuccessNotice':'You have deleted the tenant successfully'}
            jsonResponse = simplejson.dumps(response)
            return self.response.out.write(jsonResponse)
        
        tenantToDelete.removeActivity()
        tenantToDelete.unRegisterRoom()
        

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
            '''payment = Payment()
            payment.payer = tenant
            payAmount = float(data['payAmount'])       
            #if paidAmount: 
            payment.paidAmount = payAmount
            tenant.expiryDate = tenant.updateExpiryDate(payAmount)
            tenant.put()
            payment.payDate = datetime.strptime(data['payDate'],"%Y-%m-%d").date()
            payment.put()
            tenant.put()'''
            tenant.createPayRentActivityRecord(payAmount)
            response = {'payNowSuccessNotice':'Congratulations, you have paid the rent!'}
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
            '''activity = Activity(key_name = "Act_" + tenant.key().name() +'_' + str(payment.paidAmount))
            activity.activityDate = datetime.now().replace(microsecond=0)
            activity.activityTitle = "Info_Update"
            activity.put()
            tenants_url = '/tenants'
            self.redirect(tenants_url)'''
      
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

    
'''class RoomInfoHandler(webapp.RequestHandler):
    room = None  
    def get(self):
        room_key = self.request.get('room_key')
        room = Room.get(room_key)
        #path = os.path.join(os.path.dirname(__file__),'roomInfo.html')
        path = os.path.join(os.path.dirname(__file__),'roomInfo.html')
        template_values = {'room':room}
        self.response.out.write(template.render(path, template_values))
    def post(self):
        self.response.headers['Content-Type'] = 'application/json'
        jsonString = self.request.body          
        data = simplejson.loads(jsonString) #Decoding JSON    
        room_key = data['room_key']
        room = Room.get(room_key)
        if room.rentActual:
            my_response = {'returnText': "Sorry, the room is not available, please choose another one!"}
            json = simplejson.dumps(my_response)
            return self.response.out.write(json)     

            #my_response = {'room_availability': room.availability}
        else:
            room.rentActual = float(data['actualRent'])
            room.put()
            my_response = {'returnText': "Congraduations, the rent of the room has been updated!"}
            json = simplejson.dumps(my_response)#Encoding JSON
            return self.response.out.write(json)     '''       
        
class PaymentHistoryHandler(webapp.RequestHandler):
    def get(self):
        tenant_key = self.request.get('tenant_key')
        tenant = Tenant.get(tenant_key)
        data_list = tenant.getPaymentHistory()
        output_json = json.dumps(data_list)
        self.response.out.write(output_json)

        '''payments = db.GqlQuery("SELECT * "
                               "FROM Payment")
        tenant_payments = []       
        for payment in payments:
            if payment.payer.key().name() == tenant.key().name():                
                tenant_payments.append(payment)
        path = os.path.join(os.path.dirname(__file__), 'paymentHistory.html')
        template_values = {'tenant_payments': tenant_payments, "tenant":tenant}
        self.response.out.write(template.render(path, template_values))'''
        
class ShowActivityHandler(webapp.RequestHandler):
    def get(self):
        tenant_key = self.request.get('tenant_key')
        #tenant = Tenant().getTenant(tenant_key)
        tenant = Tenant.get(tenant_key)
        
        data_list = tenant.getTenantActivities()
        output_json = json.dumps(data_list)
        self.response.out.write(output_json) 
          

        ''' previous_url = self.request.get('previous_url')
        #tenant = Tenant.get_by_key_name(tenant_key, None)
        activities = []
        allActivities = db.GqlQuery("SELECT * "
                      "FROM Activity")
        for activity in allActivities:
            #if tenant.key().name()in activity.key().name():
            if tenant_key in activity.key().name():
                activities.append(activity) 
        path = os.path.join(os.path.dirname(__file__), 'activities.html')
        template_values = {'activities': activities,'tenant_key':tenant_key,'previous_url':previous_url}
        self.response.out.write(template.render(path, template_values))'''
        


       
application = webapp.WSGIApplication([('/', MainPage),
                                      ('/paynow',PayRentHandler),
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
