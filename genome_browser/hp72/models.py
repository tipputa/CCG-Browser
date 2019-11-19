from django.db import models

# Create your models here.

STRAND_CHOICE = ((1, "+"), (-1, "-"), (0, "."))

class GenbankSummary(models.Model):
    genome_ID = models.CharField(max_length=50, verbose_name='Genome ID', blank=False)
    accession = models.CharField(max_length=50, verbose_name='Accession', blank=False)
    locus_tag = models.CharField(max_length=50, verbose_name='locus Tag', blank=False, db_index=True)
    feature_name = models.CharField(max_length=10, verbose_name='feature name', blank=False)
    gene = models.CharField(max_length=10, verbose_name='gene symbol', blank=True)
    product = models.CharField(max_length=1000, verbose_name='product', blank=True)
    start = models.IntegerField("start", blank=False)
    end = models.IntegerField("end", blank=False)
    strand = models.IntegerField("strand", choices=STRAND_CHOICE, blank=False)
    nucl = models.CharField(max_length=10000, verbose_name='nucl', blank=True)
    prot = models.CharField(max_length=10000, verbose_name='prot', blank=True)

    class Meta:
        verbose_name = 'genbank summary'
        verbose_name_plural = 'genbank data'

    def __str__(self):
        return self.locus_tag

class Genome(models.Model):
    genome_ID = models.CharField(max_length=50, verbose_name='genome id', blank=False, db_index=True)
    start = models.IntegerField("start", blank=False, db_index=True)
    end = models.IntegerField("end", blank=False, db_index=True)
    seq = models.CharField(max_length=5000, verbose_name='sequence', blank=False)

    class Meta:
        verbose_name = 'genome'
        verbose_name_plural = 'genomes'

    def __str__(self):
        return self.genome_ID + ":" + self.start + "_" + self.end

class ConsensusGroup(models.Model):
    consensus_id = models.CharField(max_length=50, verbose_name="consensus id", blank=False, db_index=True)
    locus_tag = models.CharField(max_length=50, verbose_name='locus Tag', blank=False, db_index=True)

    class Meta:
        verbose_name = 'consensus group'
        verbose_name_plural = 'consensus groups'
