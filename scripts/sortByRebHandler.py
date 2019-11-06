# -*- coding: utf-8 -*-
"""
Created on Mon Nov  4 20:55:16 2019

@author: tipputa
"""

import os
import pandas as pd
import seaborn as sns
import numpy as np
import matplotlib as mpl
import matplotlib.pyplot as plt
from scipy.cluster.hierarchy import dendrogram, linkage


def get_dictionary(df, key, value):
    return df.set_index(key)[value].to_dict()

def get_all_dictionary(df, key):
    return df.set_index(key).to_dict()


def main(main_dir, tag):
    os.chdir(main_dir)
    reversal_matrix_name = "reversalMatrix_clustering_HpGP.txt"
    
    reversal_matrix = pd.read_csv(reversal_matrix_name, sep="\t")
    reversal_matrix_data = reversal_matrix.iloc[0:,1:]
    
    original_sample_info_name = "sample_info.tsv"
    original_sample_info = pd.read_csv(original_sample_info_name, sep="\t")    

    all_sample_info_name = "sample_info_all.tsv"
    all_sample_info = pd.read_csv(all_sample_info_name, sep="\t")    

    gap = 5
    single_locusTag_fName = "SingleCopy_AlmostConserved_LocusTag_minus" + str(gap) + ".tsv"
    single_locusTag_df =  pd.read_csv(single_locusTag_fName, sep="\t")    
    
    sampleID_acc_name = "sampleID_acc_list.tsv"
    name_df = pd.DataFrame(single_locusTag_df.columns[1:])
    name_df.to_csv(sampleID_acc_name, sep="\t")

    sampleID_acc_df = pd.read_csv(sampleID_acc_name, sep="\t")
    sampleID_acc_df.columns = ["SampleID", "Acc"]
    sampleID_acc_dic = get_dictionary(sampleID_acc_df, "SampleID", "Acc")
    
    HpGPID_acc_dic = get_dictionary(original_sample_info, "Strain", "Accession")
    acc_HpGPID_dic = get_dictionary(original_sample_info, "Accession", "Strain")

    # Country, Dx, Age_group, Sex
    HpGPID_annotations_dic= get_all_dictionary(all_sample_info, "HpGP_ID")        
    HpGPID_country_dic = HpGPID_annotations_dic["Country"]
 
    acc_country_dic = {}
    for i in HpGPID_country_dic.keys():
        if i in HpGPID_acc_dic:
            acc_country_dic[HpGPID_acc_dic[i]] = HpGPID_country_dic[i]

    countries = list(pd.Series(list(acc_country_dic.values())).drop_duplicates())
    
    shortCountryCode_country_dic = {}
    for i in HpGPID_country_dic.keys():
        shortCode = i.split("-")[0]
        if not shortCode in shortCountryCode_country_dic:
            shortCountryCode_country_dic[shortCode] = HpGPID_country_dic[i]
    
    sampleIDs = list(reversal_matrix_data.columns)
    HpGPIDs = [acc_HpGPID_dic[sampleID_acc_dic[int(i)]] for i in sampleIDs]    
    reversal_matrix_data.columns = HpGPIDs
    
    HpGPID_Dx_dic = HpGPID_annotations_dic["Dx"]
    Dxs = []
    for i in HpGPIDs:
        if i in HpGPID_Dx_dic:
            if str(HpGPID_Dx_dic[i]) == "nan":
                Dxs.append(4.0)
            else:
                Dxs.append(HpGPID_Dx_dic[i])
        else:
            Dxs.append(4.0)

    # check number of supporting genomes    
    num_genomes_having_rearrangements = reversal_matrix_data.apply(sum, axis=1)
        
    # plot all heat map 
    sns.clustermap(reversal_matrix_data, figsize=(100,20))
    # morethan3 
    sns.clustermap(reversal_matrix_data[num_genomes_having_rearrangements>3], figsize=(100,20))
    
    accs = [sampleID_acc_dic[int(i)] for i in sampleIDs]    
    all_country_list = [shortCountryCode_country_dic[i.split("-")[0]] for i in HpGPIDs]

    reversal_matrix_data.columns = accs

    # all hist
    sns.distplot(num_genomes_having_rearrangements, kde=False, bins=30)
    # >3 rearrangements hist
    sns.distplot(num_genomes_having_rearrangements[num_genomes_having_rearrangements>3], kde=False, bins=30)

    
    reversal_matrix_data_moreThan3 = reversal_matrix_data[num_genomes_having_rearrangements>3]
    
    num_rev_by_country = []
    reversal_matrix_data_moreThan3.columns = all_country_list
    reversal_matrix_data_moreThan3.apply(count_country_rev, axis=1, buf = num_rev_by_country)
    reversal_matrix_countBycountry = pd.DataFrame(num_rev_by_country)
    reversal_matrix_countBycountry.columns = countries
    reversal_matrix_countBycountry.index = reversal_matrix_data_moreThan3.index
    reversal_matrix_countBycountry

    sns.clustermap(reversal_matrix_countBycountry, figsize=(30,20), method="complete")
    
    # num genomes
    plt.figure(figsize=(20,10))
    sns.countplot(all_country_list)
    plt.savefig("numCountries.png")
    
    num_genomes_by_country = {}
    for i in all_country_list:
        if i in num_genomes_by_country:
            num_genomes_by_country[i] += 1
        else:
            num_genomes_by_country[i] = 1
    
    for i in num_genomes_by_country.keys():
        reversal_matrix_countBycountry[i] = reversal_matrix_countBycountry[i] / num_genomes_by_country[i]

    sns.clustermap(reversal_matrix_countBycountry, figsize=(30,20), method="complete")
    
    
    # Dx
    num_genomes_by_dx = []
    reversal_matrix_data_moreThan3.columns = Dxs
    reversal_matrix_data_moreThan3.apply(count_country_rev, axis=1, buf = num_genomes_by_dx)
    reversal_matrix_countBydx = pd.DataFrame(num_genomes_by_dx)
    reversal_matrix_countBydx.columns = ["NAG", "AdvancedIntestinalMetaplasia", "GastricCancer", "None"]
    reversal_matrix_countBydx.index = reversal_matrix_data_moreThan3.index
    reversal_matrix_countBydx

    sns.clustermap(reversal_matrix_countBydx, figsize=(20,20), method="complete")

    
    Dxs_renames = []
    for i in Dxs:
        if i == 0:
            Dxs_renames.append("NAG")
        if i == 1:
            Dxs_renames.append("AdvancedIntestinalMetaplasia")
        if i == 2:
            Dxs_renames.append("GastricCancer")
        if i == 4:
            Dxs_renames.append("None")
    

    plt.figure(figsize=(10,10))
    sns.countplot(Dxs_renames)
    plt.savefig("numDiagnosis.png")
    
    num_genomes_by_dx = {}
    for i in Dxs_renames:
        if i in num_genomes_by_dx:
            num_genomes_by_dx[i] += 1
        else:
            num_genomes_by_dx[i] = 1

    for i in num_genomes_by_dx.keys():
        reversal_matrix_countBydx[i] = reversal_matrix_countBydx[i] / num_genomes_by_dx[i]

    sns.clustermap(reversal_matrix_countBydx, figsize=(20,20), method="complete")

    
def count_country_rev(series, buf):
    count = list(series.groupby(level=0).sum())
    buf.append(count);
    
if __name__ == '__main__':
    #main_dir="G:/マイドライブ/1_study/6_pylori/HpGP/all"
    main_dir = "C:/Users/tipputa/Desktop/HpGP_all"
    tag = ""
    main(main_dir, tag)    