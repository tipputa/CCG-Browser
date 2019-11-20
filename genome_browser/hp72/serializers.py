from rest_framework import serializers
from .models import GenbankSummary, Genome

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

class RetrieveAllFromGenomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genome
        fields = ('start','end', 'seq')

class CommentSerializer(serializers.Serializer):
    genome_ID = serializers.CharField(max_length=200)
    start = serializers.IntegerField()
    end = serializers.IntegerField()
    seq = serializers.CharField()
    def update(self, instance, validated_data):
        instance.genome_ID = validated_data.get('genome_ID', instance.genome_ID)
        instance.start = validated_data.get('start', instance.start)
        instance.end = validated_data.get('end', instance.end)
        instance.seq = validated_data.get('seq', instance.seq)
        return instance

class RetriveSameConsensusGroup(serializers.Serializer):
    genome_ID = serializers.CharField(max_length=200)
    start = serializers.IntegerField()
    end = serializers.IntegerField()
    locus_tag = serializers.CharField()

    def update(self, instance, validated_data):
        instance.genome_ID = validated_data.get('genome_ID', instance.genome_ID)
        instance.locus_tag = validated_data.get('locus_tag', instance.locus_tag)
        instance.start = validated_data.get('start', instance.start)
        instance.end = validated_data.get('end', instance.end)
        return instance
