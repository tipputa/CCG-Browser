from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from .models import GenbankSummary, ConsensusGroup, Genome
from .serializers import *
from django.shortcuts import get_object_or_404, get_list_or_404


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

""" Genome """
class RetrieveAllGenome(generics.ListAPIView):
    serializer_class = RetrieveAllFromGenomeSerializer
    def get_queryset(self):
        return Genome.objects.filter(genome_ID=self.kwargs["genome_ID"])

class RetrieveTargetGenomicRegion(generics.ListAPIView):
    serializer_class = RetrieveAllFromGenomeSerializer
    def get_queryset(self):
        return Genome.objects.filter(genome_ID=self.kwargs["genome_ID"]).filter(start__lt=self.kwargs["start"]).filter(end__gt=self.kwargs["end"])[:1]

class RetriveTest(APIView):
    serializer_class = RetrievePositionsFromGBSerializer
    # parser_classes = [JSONParser] # default

    def post(self, request, *args, **kwargs):
        #self.queryset = GenbankSummary.objects.all()[:self.request.data["num"]]
        #for seq in data = self.request.data["seqs"]:
        #    Genome.objects.filter(genome_ID=self.kwargs["genome_ID"]).filter(start__lt=self.kwargs["start"]).filter(end__gt=self.kwargs["end"])[:1]            

        all_res = [CommentSerializer(get_object_or_404(Genome.objects.filter(genome_ID=seq["genome_ID"]).filter(start__lte=seq["start"]).filter(end__gte=seq["end"])[:1])).data for seq in self.request.data["seqs"]]

        """ this is too slow
        seq = self.request.data["seqs"][0]
        p2 = Genome.objects.filter(genome_ID=seq["genome_ID"]).filter(start__lte=seq["start"]).filter(end__gte=seq["end"])[:1]
        for seq in self.request.data["seqs"][1:]:
            p1 = Genome.objects.filter(genome_ID=seq["genome_ID"]).filter(start__lte=seq["start"]).filter(end__gte=seq["end"])[:1]
            p2 = p2 | p1

        all_res = CommentSerializer(get_list_or_404(p2), many=True).data
        """
        return Response({"res": all_res})

class RetriveConsensusGroup(generics.ListAPIView):
    serializer_class = RetriveSameConsensusGroup
    def get_queryset(self):
        #return ConsensusGroup.objects.filter(consensus_id=self.kwargs["consensus_id"])
        return ConsensusGroup.objects.filter(consensus_id=self.kwargs["consensus_id"]).extra(
            tables=['hp72_genbanksummary'],
            where=['hp72_genbanksummary.locus_tag=hp72_consensusgroup.locus_tag']
        )
