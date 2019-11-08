from rest_framework import generics

from .models import GenbankSummary
from .serializers import *

""" genome ID """
## all
class RetrieveAllByGenomeIDFromGB(generics.ListAPIView):
    serializer_class = RetrieveAllFromGBSerializer
    def get_queryset(self):
        return GenbankSummary.objects.filter(genome_ID=self.kwargs["genome_ID"])

""" locus tag """
## all
class RetrieveAllByLocusTagFromGB(generics.ListAPIView):
    serializer_class = RetrieveAllFromGBSerializer
    def get_queryset(self):
        return [GenbankSummary.objects.get(locus_tag=self.kwargs["locusTag"])]

## position
class RetrievePositionByLocusTagFromGB(generics.ListAPIView):
    serializer_class = RetrievePositionsFromGBSerializer
    def get_queryset(self):
        return [GenbankSummary.objects.get(locus_tag=self.kwargs["locusTag"])]

## protein sequence
class RetrieveProteinByLocusTagFromGB(generics.ListAPIView):
    serializer_class = RetrieveProteinFromGBSerializer
    def get_queryset(self):
        return [GenbankSummary.objects.get(locus_tag=self.kwargs["locusTag"])]

## CDS
class RetrieveCodingSeqByLocusTagFromGB(generics.ListAPIView):
    serializer_class = RetrieveCodingSeqFromGBSerializer
    def get_queryset(self):
        return [GenbankSummary.objects.get(locus_tag=self.kwargs["locusTag"])]


""" test  """
class RetrieveTest(generics.ListAPIView):
    serializer_class = RetrievePositionsFromGBSerializer
    def get_queryset(self):
        return GenbankSummary.objects.all()[:self.kwargs["num"]]
