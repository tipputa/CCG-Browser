from django.urls import path
from .views import *

urlpatterns = [
    path('api/genbank/all/genome_id/<str:genome_ID>', RetrieveAllByGenomeIDFromGB.as_view()),
    path('api/genbank/all/locusTag/<str:locusTag>', RetrieveAllByLocusTagFromGB.as_view()),
    path('api/genbank/position/locusTag/<str:locusTag>', RetrievePositionByLocusTagFromGB.as_view()),
    path('api/genbank/protein/locusTag/<str:locusTag>', RetrieveProteinByLocusTagFromGB.as_view()),
    path('api/genbank/cds/locusTag/<str:locusTag>', RetrieveCodingSeqByLocusTagFromGB.as_view()),
    path('api/genbank/<int:num>', RetrieveTest.as_view()),
]

