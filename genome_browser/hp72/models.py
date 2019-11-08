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