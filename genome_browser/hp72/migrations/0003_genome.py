# Generated by Django 2.2.7 on 2019-11-11 10:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hp72', '0002_auto_20191108_1843'),
    ]

    operations = [
        migrations.CreateModel(
            name='Genome',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('genome_ID', models.CharField(max_length=50, verbose_name='Genome ID')),
                ('start', models.IntegerField(verbose_name='start')),
                ('end', models.IntegerField(verbose_name='end')),
            ],
            options={
                'verbose_name': 'genome',
                'verbose_name_plural': 'genomes',
            },
        ),
    ]
