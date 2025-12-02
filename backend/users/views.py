from rest_framework import viewsets
from .models import RecycleUser, ServiceProvider
from .serializers import RecycleUserSerializer, ServiceProviderSerializer

class RecycleUserViewSet(viewsets.ModelViewSet):
    queryset = RecycleUser.objects.all()
    serializer_class = RecycleUserSerializer

class ServiceProviderViewSet(viewsets.ModelViewSet):
    queryset = ServiceProvider.objects.all()
    serializer_class = ServiceProviderSerializer