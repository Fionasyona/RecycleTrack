from rest_framework import viewsets
from .models import WasteCategory, DisposalReport
from .serializers import WasteCategorySerializer, DisposalReportSerializer

class WasteCategoryViewSet(viewsets.ModelViewSet):
    queryset = WasteCategory.objects.all()
    serializer_class = WasteCategorySerializer

class DisposalReportViewSet(viewsets.ModelViewSet):
    queryset = DisposalReport.objects.all().order_by('-created_at') # Newest first
    serializer_class = DisposalReportSerializer