# Generated by Django 2.2.7 on 2019-11-08 18:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hp72', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='genbanksummary',
            name='product',
            field=models.CharField(blank=True, max_length=1000, verbose_name='product'),
        ),
    ]
