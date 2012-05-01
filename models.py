'''
Created on Oct 12, 2011

@author: qliu040
'''

from google.appengine.ext import db
from django.http import HttpResponse
from datetime import date
from datetime import timedelta
import math
import re
from datetime import datetime
   

class Room(db.Model):
    #tenant = db.ReferenceProperty(required = False)
    tenant = db.ReferenceProperty()#test
    roomNumber = db.StringProperty(required = False)    
    size = db.FloatProperty()
    rentSingle = db.FloatProperty()
    rentDouble = db.FloatProperty()
    rentActual = db.FloatProperty()    
    '''@staticmethod
    def get_or_insert_by_number(roomNumber):
        key_name = 'number:' + roomNumber
        return Room.get_or_insert(key_name, roomNumber = roomNumber)
    def setTenant(self, tenant1):
        self.tenant = tenant1
        tenant1.room = self'''
    def notFull(self):
        rooms = Room.all()
        for room in rooms:
            if (not room.tenant):
                return True
        return False
            
            
    def getRoomProfile(self):
        rooms = db.GqlQuery("SELECT * "
                      "FROM Room")
        data_list = []
        for room in rooms:
            if room.key()== self.key():
                data_list.append({'roomNumber':room.roomNumber,'size':room.size,'rentSingle':room.rentSingle,'rentDouble':room.rentDouble,'rentActual':room.rentActual})          
        return data_list
    
    def getAvailableRoomsProfile(self):
        rooms = Room.all()
        rooms_data_list = []
        for room in rooms:
            if (not room.tenant):
                rooms_data_list.append({'roomKey':str(room.key()),'roomNumber':room.roomNumber,'size':room.size,'rentSingle':room.rentSingle,'rentDouble':room.rentDouble,'rentActual':room.rentActual})
        return rooms_data_list
        
        
    def updateRoomProfile(self,data):
        rooms = db.GqlQuery("SELECT * "
              "FROM Room")
        for room in rooms:
            if room.key() == self.key():
                room.roomNumber = data['number']
                room.size = float(data['size'])
                room.rentSingle = float(data['rentSingle'])
                room.rentDouble = float(data['rentDouble'])
                room.rentActual = float(data['rentActual'])
                room.put()
        return True
      
class Tenant(db.Model):
    #payment = db.ReferenceProperty(required = False)
    #payment = db.ReferenceProperty() #test
    tenantHistory = db.ReferenceProperty()
    #tenantHistory = db.ReferenceProperty()
    room = db.ReferenceProperty(Room)
    firstName = db.StringProperty()
    surname = db.StringProperty()
    gender = db.StringProperty()
    age = db.IntegerProperty(default = 20)
    phoneNumber = db.PhoneNumberProperty()
    contactName = db.StringProperty()
    contactPhoneNumber = db.PhoneNumberProperty()
    email = db.EmailProperty()  
    payPeriod = db.IntegerProperty(default = 1)    
    expiryDate = db.DateProperty()  
    startDate = db.DateProperty(auto_now_add = True)
    registerDate = db.DateProperty(auto_now_add = True)  
    #status = db.StringListProperty(['active', 'inactive', 'suspend'])
    #totalPaidRent = db.FloatProperty(default = 0.0)
    #lastPayDate = db.DateProperty()
   
    '''def getTenant(self,tenant_key):      
        tenants = db.GqlQuery("SELECT * "
                      "FROM Tenant")
        for tenant in tenants:
            if tenant.key() in tenant_key:                    
                return tenant'''
    def getCurrentTenants(self):
        tenants = db.GqlQuery("SELECT * "
                              "FROM Tenant")
        activities = db.GqlQuery("SELECT * FROM Activity WHERE activityName = :1 ORDER BY activityDate" ,"Tenant_Checkout",)
        currentTenants = []
        if activities.get():
            for tenant in tenants:
                for activity in activities:            
                
                    if str(tenant.key()) in activity.key().name():
                     
                        break
                else:
                    currentTenants.append(tenant)
                        
        else:
            for tenant in tenants:
                currentTenants.append(tenant)  
                    
        return currentTenants     
                    
    def getPreviousTenants(self):
        tenants = db.GqlQuery("SELECT * "
                              "FROM Tenant")
        activities = db.GqlQuery("SELECT * FROM Activity WHERE activityName = :1 ORDER BY activityDate" ,"Tenant_Checkout")
        previousTenants_json = []
        i = 1
        for t in tenants:
            for activity in activities:            
            
                if str(t.key()) in activity.key().name():
                    #previousTenants.append(tenant)
                    checkoutDate = activity.activityDate
                    #rent = re.findall(r'$([^$]+)$', activity.key().name())[0]
                    rent = activity.key().name().split('_')[3]
                    previousTenants_json.append({'tenantKey':str(t.key()),'tenantNumber': i,'firstName':t.firstName,'surname':t.surname,'gender':t.gender,'age':t.age,'phoneNumber':t.phoneNumber,'contactName':t.contactName,'contactPhoneNumber':t.contactPhoneNumber,'email':t.email,'roomNumber':t.room.roomNumber,'rent':rent,'startDate':t.startDate.isoformat(),'checkoutDate':checkoutDate.isoformat(),'totalPaidRent':t.getTotalPaidRent()})
                    i = i + 1
                    break
        return previousTenants_json
    
    '''def getTenantHistory(self):
        tenantHistories = db.GqlQuery("SELECT * "
                                    "FROM TenantHistory ORDER BY startDate")
        data_list = []
        i = 1
        for th in tenantHistories:         
                data_list.append({'tenantKeyName':th.key().name(),'tenantNumber': i,'firstName':th.firstName,'surname':th.surname,'gender':th.gender,'age':th.age,'phoneNumber':th.phoneNumber,'contactName':th.contactName,'contactPhoneNumber':th.contactPhoneNumber,'email':th.email,'roomNumber':th.roomNumber,'rent':th.rent,'startDate':th.startDate.isoformat(),'checkoutDate':th.checkoutDate.isoformat(),'totalPaidRent':th.totalPaidRent})          
                i = i + 1
        return data_list '''
    
    def getLastPayDate(self):
        
        payments = db.GqlQuery("SELECT * "
                    "FROM Payment")
        payDates = []
        if payments:
            for payment in payments:    
                    if payment.payer.key().name() == self.key().name():
                        payDates.append(payment.payDate)
        if not payDates:
            return None
        else:
            return max(payDates)
        
    def getRent(self):
        if self.room:
            return self.room.rentActual
        else:
            return None
    
    def paymentIsClear(self):
        '''Get this week's payment status'''
        #today = datetime.date.today()
        today = date.today()
        if self.expiryDate == None:
            #self.status = 'suspend'
            return False
        else:
            #self.status = 'active'
            return self.expiryDate > today 
      
    def getUnpaidWeeks(self):
        #today = datetime.date.today()
        today = date.today()
        startDay = self.startDate.weekday()
        if (today.weekday() == startDay):        
            if(self.expiryDate.weekday() == startDay):
                weeks = (today - self.expiryDate).days/7.0
            else:
                weeks = int(math.ceil((today - self.expiryDate).days/7.0))   
        elif(startDay > today.weekday()):  
            daysToStartDay = timedelta(abs(startDay - today.weekday()))
            weeks = int(math.ceil((today + daysToStartDay - self.expiryDate).days/7.0))
        else:
            daysToStartDay = timedelta(7 - abs(startDay -today.weekday()))
            weeks = int(math.ceil((today + daysToStartDay - self.expiryDate).days/7.0))
        return weeks
    
    def getRentToPay(self):
        #today = datetime.date.today()
        today = date.today()
        startDay = self.startDate.weekday()
     
        if(today.weekday() == startDay):
            rentToPay = (today-self.expiryDate).days*self.getRentRate()
        elif (startDay > today.weekday()):
            daysToStartDay = timedelta(abs(startDay -today.weekday()))
            rentToPay = (today + daysToStartDay - self.expiryDate).days*self.getRentRate()
        else:
            daysToStartDay = timedelta(7 - abs(startDay -today.weekday()))
            rentToPay = (today + daysToStartDay - self.expiryDate).days*self.getRentRate()
        return round(rentToPay,1)

    def getUnpaidRent(self):
        return round(self.getUnpaidDays()*self.getRentRate(),1)
           
    def getUnpaidDays(self):
        #today = datetime.date.today()
        today = date.today()
        expiryDate = self.expiryDate
        return (today-expiryDate).days
                     
    
    def updateExpiryDate(self,payAmount):        
        rate = self.getRentRate()
        days = int(payAmount / rate)
        paid_days = timedelta(days = days)         
        return self.expiryDate + paid_days
    

    def getLivingPeriod(self):
        #today = datetime.date.today()
        today = date.today()
        startDay = self.startDate       
        return (today-startDay).days
    
    def getRentRate(self):
        return round(self.getRent()/7.0,1)
        
    def deleteEntry(self):
        self.delete()
    
    def getString(self):
        return "here u go!"
    
#this is just a test snippet 
    def current_datetime(self):
        now = datetime.datetime.now()
        html = "<html><body>It is now %s.</body></html>" % now
        return HttpResponse(html)
    
    def getTotalPaidRent(self):       
        totalPaidRent = 0         
        payments = db.GqlQuery("SELECT * "
                    "FROM Payment")
        for payment in payments:
            if payment.payer.key() == self.key():
                totalPaidRent = totalPaidRent + payment.paidAmount
        return float(totalPaidRent) 
    
    def getPaymentHistory(self):
        payments = db.GqlQuery("SELECT * "
                               "FROM Payment ORDER BY payDate")
        #tenant= self.request.get('tenant')
        payments_list = []
        #tenant = Tenant.get(tenant_key)
        i = 1
        for payment in payments:
            if payment.payer.key() == self.key():                
                payments_list.append({'paymentNumber': self.firstName + "_" + self.surname + "_" + str(i),'payDate': payment.payDate.isoformat(), 'paidAmount': payment.paidAmount})
                i = i+1
        payments_list.append({'totalPaidRent':self.getTotalPaidRent()}) 
        return payments_list
    
    def registerRoom(self,data):
        room_key = data['room_key']       
        room = Room.get(room_key)
        room.rentActual = float(data['actualRent'])                                  
        self.room = room
        self.payPeriod = int(data['payPeriod'])       
        startDate = datetime.strptime(data['startDate'],"%Y-%m-%d")
        self.startDate = startDate.date()
        self.expiryDate = startDate.date()
        self.put()
        room.tenant = self
        room.put()
    
    def updatePayment(self,data): 
        payment = Payment()
        payment.payer = self
        payAmount = float(data['payAmount'])       
        payment.paidAmount = payAmount
        self.expiryDate = self.updateExpiryDate(payAmount)
        self.put()
        payment.payDate = datetime.strptime(data['payDate'],"%Y-%m-%d").date()
        payment.put()
        return payAmount
                 
    def saveToHistory(self):
        #tenantHistory = db.ReferenceProperty(TenantHistory)
        #tenantHistory = TenantHistory()
        tenantHistories = db.GqlQuery("SELECT * "
                                      "FROM TenantHistory")
        for tenantHistory in tenantHistories:
            if (self.firstName + "_" + self.surname) in tenantHistory.key().name():
                ''' self.tenantHistory.firstName = self.firstName
                self.tenantHistory.surname = self.surname
                self.tenantHistory.gender = self.gender
                self.tenantHistory.totalPaidRent = self.getTotalPaidRent()
                self.tenantHistory.phoneNumber = self.phoneNumber
                self.tenantHistory.contactName = self.contactName
                self.tenantHistory.contactPhoneNumber = self.contactPhoneNumber
                self.tenantHistory.email = self.email  
                self.tenantHistory.payPeriod = self.payPeriod          
                self.tenantHistory.startDate = self.startDate
                self.tenantHistory.roomNumber = self.room.roomNumber
                self.tenantHistory.rent = self.room.rentActual
                self.tenantHistory.put()'''
                
                tenantHistory.firstName = self.firstName
                tenantHistory.surname = self.surname
                tenantHistory.gender = self.gender
                tenantHistory.totalPaidRent = self.getTotalPaidRent()
                tenantHistory.phoneNumber = self.phoneNumber
                tenantHistory.contactName = self.contactName
                tenantHistory.contactPhoneNumber = self.contactPhoneNumber
                tenantHistory.email = self.email  
                tenantHistory.payPeriod = self.payPeriod          
                tenantHistory.startDate = self.startDate
                tenantHistory.roomNumber = self.room.roomNumber
                tenantHistory.rent = self.room.rentActual
                #tenantHistory.activities = self.getTenantActivity()
                #tenantHistory.activities = self.getTenantActivityKey()
                tenantHistory.put()
                
    def clearPaymentRecord(self):
        payments = db.GqlQuery("SELECT * "
                              "FROM Payment")
        for payment in payments:
            if payment.payer.key() == self.key():
                db.delete(payment) 
                           
    def unRegisterRoom(self):
        tenants = db.GqlQuery("SELECT * "
                              "FROM Tenant")
        for tenant in tenants:
            if tenant.key() == self.key():
                if tenant.room:
                    tenant.room.tenant = None
                    tenant.room.rentActual = None
                    #tenant.room.availability = True
                    tenant.room.put()
                
                    
    def removeActivity(self):
        allActivities = db.GqlQuery("SELECT * "
                                    "FROM Activity ORDER BY activityDate")
        for activity in allActivities:
            if str(self.key()) in activity.key().name():
                activity.delete() 
                

    def getTenantProfile(self):
        tenants = db.GqlQuery("SELECT * "
                      "FROM Tenant")
        data_list = []
        for tenant in tenants:
            if tenant.key()== self.key():
                data_list.append({'firstName':tenant.firstName,'surname':tenant.surname,'gender':tenant.gender,'age':tenant.age,'phoneNumber':tenant.phoneNumber,'email':tenant.email,'contactName':tenant.contactName,'contactPhoneNumber':tenant.contactPhoneNumber,'registerDate': tenant.registerDate.isoformat()})          
        return data_list
    
    def getTenantActivities(self):
        activities = db.GqlQuery("SELECT * "
                              "FROM Activity ORDER BY activityDate")
        data_list = []
        i = 1
        for activity in activities:
            if str(self.key()) in activity.key().name():
                '''data = {
                    'activityNumber': self.firstName + "_" + self.surname + "_" + str(i),
                    'activityTitle':activity.activityTitle,
                    'activityDate':activity.activityDate.isoformat()
                }'''
                data_list.append({
                    'activityNumber': self.firstName + "_" + self.surname + "_" + str(i),
                    'activityName':activity.activityName,
                    'activityDate':activity.activityDate.isoformat()})
                i = i + 1
        return data_list
    
    '''def getTenantActivityKey(self):
        allActivities = db.GqlQuery("SELECT * "
                      "FROM Activity ORDER BY activityDate")
        activityKey = []
        for activity in allActivities:
            if str(self.key()) in activity.key().name():
                activityKey.append(activity.key())
        return activityKey'''
            
    def updateTenantProfile(self,data):
        tenants = db.GqlQuery("SELECT * "
                      "FROM Tenant")
        for tenant in tenants:
            if tenant.key() == self.key():
                tenant.firstName = data['firstName']
                tenant.surname = data['surname']
    
                tenant.gender = data['gender']
                tenant.age = int(data['age'])
                tenant.phoneNumber = data['phoneNumber']
                tenant.email = data['email']
                tenant.contactName = data['contactName']
                tenant.contactPhoneNumber = data['contactPhoneNumber']
                tenant.put()
        return True
    
    
    def registerTenant(self,data):
        tenant = Tenant(key_name = data['firstName']+ '_' + data['surname'] )         
        #tenant = Tenant(key_name = self.request.get('firstName')+'_' + self.request.get('surname'))      
        tenant.firstName = data['firstName']
        tenant.surname = data['surname']
        tenant.gender = data['gender']
        tenant.age = int(data['age'])
        tenant.phoneNumber = data['phoneNumber'] 
        tenant.contactName = data['contactName']
        tenant.contactPhoneNumber = data['contactPhoneNumber']
        #tenant.registerDate = data['registerDate']
        registerDate = datetime.strptime(data['registerDate'],"%Y-%m-%d")
        tenant.registerDate = registerDate.date()    
        tenant.put()
        return tenant
    
    def getTenantCheckoutInfo(self):
        tenants = db.GqlQuery("SELECT * "
                      "FROM Tenant")
        data_list = []
        for tenant in tenants:
            if tenant.key()== self.key():
                data_list.append({'firstName':tenant.firstName,'surname':tenant.surname,'roomNumber':tenant.room.roomNumber,'startDate':tenant.startDate.isoformat(),'livingPeriod':tenant.getLivingPeriod(),'rent':tenant.getRent(),'rentRate':tenant.getRentRate(),'totalPaidRent':tenant.getTotalPaidRent(),'unpaidDays': tenant.getUnpaidDays(),'unpaidRent':tenant.getUnpaidRent()})          
        return data_list
    
    def createPayRentActivityRecord(self,payAmount):
        activity = Activity(key_name = "Key_" + str(self.key()) +'_' + str(payAmount))
        activity.activityDate = datetime.now().replace(microsecond=0)
        activity.activityName = "PayRent"
        activity.put()
        
    def createRegisterActivityRecord(self):
        #activity = Activity(key_name = "Act_" + self.key().name())
        activity = Activity(key_name = "Key_" + str(self.key()))
        activity.activityDate = datetime.now().replace(microsecond=0)
        activity.activityName = "Register"
        activity.put() 
        
    def createCheckinActivityRecord(self):
        activity = Activity(key_name = "Key_" + str(self.key()) +'_' + str(self.room.roomNumber))
        #activity.tenant = tenant
        activity.activityDate = datetime.now().replace(microsecond=0)
        activity.activityName = "Checkin"
        activity.put()
    
    def createCheckoutActivityRecord(self):
        activity = Activity(key_name = "Key_" + str(self.key()) +'_' + str(self.room.roomNumber)+ "_" + str(self.room.rentActual))
        activity.activityDate = datetime.now().replace(microsecond=0)
        activity.activityName = "Checkout"
        #activity.activityContent = "Rent_" + self.room.rentActual
        activity.put()
    
class Payment(db.Model):
    #tenant = db.ReferenceProperty(required = False)
    #payer = db.ReferenceProperty(Tenant)
    payer=db.ReferenceProperty() #test
    paidAmount = db.FloatProperty(default = 0.0)       
    payDate = db.DateProperty(auto_now_add = True)
    
class Activity(db.Model):
    #tenant = db.ReferenceProperty()
    activityName = db.StringProperty()
    activityContent = db.StringProperty()
    activityDate = db.DateTimeProperty(auto_now_add = True)
     

   
'''class TenantHistory(db.Model): 
    #tenant = db.ReferenceProperty()
    firstName = db.StringProperty()
    surname = db.StringProperty()
    gender = db.StringProperty()
    age = db.IntegerProperty(default = 20)
    phoneNumber  = db.PhoneNumberProperty()
    contactName  = db.StringProperty()
    contactPhoneNumber  = db.PhoneNumberProperty()
    email  = db.EmailProperty()  
    livingPeriod  = db.IntegerProperty(default = 1)          
    startDate  = db.DateProperty()
    checkoutDate  = db.DateProperty(auto_now_add = True)
    totalPaidRent  = db.FloatProperty(default = 0.0)
    roomNumber  = db.StringProperty()
    rent = db.FloatProperty()
    #activities = db.StringListProperty()
    #activities = db.ListProperty(db.Key)
    def getTenantHistory(self):
        tenantHistories = db.GqlQuery("SELECT * "
                                    "FROM TenantHistory ORDER BY startDate")
        data_list = []
        i = 1
        for th in tenantHistories:         
                data_list.append({'tenantKeyName':th.key().name(),'tenantNumber': i,'firstName':th.firstName,'surname':th.surname,'gender':th.gender,'age':th.age,'phoneNumber':th.phoneNumber,'contactName':th.contactName,'contactPhoneNumber':th.contactPhoneNumber,'email':th.email,'roomNumber':th.roomNumber,'rent':th.rent,'startDate':th.startDate.isoformat(),'checkoutDate':th.checkoutDate.isoformat(),'totalPaidRent':th.totalPaidRent})          
                i = i + 1
        return data_list'''

        

    
        

    