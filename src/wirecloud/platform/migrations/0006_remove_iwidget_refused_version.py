# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-09 15:37
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('platform', '0005_add_multiuser_variable_support'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='iwidget',
            name='refused_version',
        ),
    ]