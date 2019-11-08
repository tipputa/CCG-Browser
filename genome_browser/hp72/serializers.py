from rest_framework import serializers
from .models import GenbankSummary

class RetrieveAllFromGBSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenbankSummary
        fields = '__all__'

class RetrievePositionsFromGBSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenbankSummary
        fields = ('start', 'end', 'strand')

class RetrieveProteinFromGBSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenbankSummary
        fields = ('prot',)

class RetrieveCodingSeqFromGBSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenbankSummary
        fields = ('nucl',)

