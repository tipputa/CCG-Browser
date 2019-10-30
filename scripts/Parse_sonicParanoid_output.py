# -*- coding: utf-8 -*-
"""
Created on Fri Sep 20 20:30:53 2019

@author: tipputa
"""

import os, csv
import pandas as pd
from Bio import SeqIO 

def getGenBankInfoAsBuffer(gbFile, buffer):
    record = SeqIO.read(gbFile, "genbank")    
    for feature in record.features:
        if feature.type in ["CDS", "rRNA", "tRNA"]:
            locus_tag = feature.qualifiers.get("locus_tag", [""])[0]
            product = feature.qualifiers.get("product", ["Unknown"])[0]
            gene = feature.qualifiers.get("gene", [""])[0]
            pos_start = str(feature.location.start).replace(">", "").replace("<", "")
            pos_end = str(feature.location.end).replace(">", "").replace("<", "")
            strand = str(feature.location.strand)
            nucleotide = str(feature.location.extract(record).seq)
            translation = feature.qualifiers.get("translation", [""])[0]
            buffer.append((record.id, locus_tag, feature.type, gene, product, pos_start, pos_end, strand, nucleotide, translation))            
    

def searchDf(df, tag, col):
    return df[df.iloc[:, col]==tag]

def getMap(df, key, value):
    return df.set_index(key)[value].to_dict()

def convertLocusTag2Column(s, m):
    return s.map(m)
    
def setPositionFromDf(gbDf, df):
    m = getMap(gbDf, "locusTag", "start")
    return df.apply(convertLocusTag2Column, axis=1, args=(m,))
    
def getPosition(gbFile, df): # without strand
    record = SeqIO.read(gbFile, "genbank")
    target = df[str(record.id)]        
    
    for feature in record.features:
        if feature.type == "CDS":
            locus_tag = feature.qualifiers.get("locus_tag")
            pos_start = str(feature.location.start)
            target[target==locus_tag[0]] = pos_start
    df[str(record.id)] = target
    return(df)

def get_single_copy_genes(array, numThreshold):
    """ cluster size == num genomes, num genomes >= threshold"""
    return array.iloc[2] == array.iloc[1] and array.iloc[2] >= numThreshold

def convert_asterisk_to_hyphen(arr):
    return [i.replace("*", "-") for i in arr]
        
def createCsvFromGenBank(gbDir, outputFileName):
    files = os.listdir(gbDir)
    NumGB = len([file for file in files if file.endswith(".gb")  or file.endswith('.gbk')])
    LoopCounter = 1
    
    buffer = [("acc","locusTag", "feature", "gene", "product", "start", "end", "strand", "nuc", "prot")]
    for file in files:
        if file.endswith(".gb") or file.endswith('.gbk'): 
            print("Reading: " + file + "  "+ str(LoopCounter) + "/" + str(NumGB))
            LoopCounter = LoopCounter + 1
            getGenBankInfoAsBuffer(gbDir + file, buffer)

    df = pd.DataFrame(buffer)
    df.to_csv(outputFileName, sep="\t", index=None, header=None)    

    

def sortAndConvert2Index(series):
    s = series.sort_values().dropna()
    s2 = s.index.to_series()
    s2.index = range(len(s2))
    return s2.astype(int)
    
def main(dir, tag, gap):
    os.chdir(dir)
    isCreateGbSummary = True    
    isHp72 = False

    locusTag_fName = "LocusTag_minus" + str(gap) + ".tsv"
    single_locusTag_fName = "SingleCopy_AlmostConserved_LocusTag_minus" + str(gap) + ".tsv"
    remain_locusTag_fName = "Remaining_LocusTag_minus" + str(gap) + ".tsv"
    gene_order_fName = "gene_order_Hp73.txt"
    gene_order_rm_fName = "gene_order_" + tag + ".txt"
    reorders_fName = "reorder_info.tsv"
    accID_genomeSize_fName = "AccID_GenomeSize.tsv"    
    
    gbDir = dir + "/gb/"    
    gbSummary_fName = dir + "/gbSummary.tsv" 
    if(isCreateGbSummary):
        createCsvFromGenBank(gbDir, gbSummary_fName)    

    gb_df = pd.read_csv(gbSummary_fName, sep="\t", engine="python")

    ortholog_group_file = "./ortholog_groups/ortholog_groups.tsv"
    ortholog_group_df = pd.read_csv(ortholog_group_file, sep="\t")


    # df have 4 additional columns and 2 * genomes
    numCol = len(ortholog_group_df.columns)
    numGenomes = int((numCol - 4) / 2)    
    numGenomes

    ortholog_group_df.columns = [i.replace(".fa", "") for i in ortholog_group_df.columns]
    is_locusTag = [False for i in range(4)] + [True if i % 2 == 0 else False for i in range(numGenomes*2) ]
    ortholog_group_tag = ortholog_group_df.iloc[:, is_locusTag]

    # get single copy genes and conserved genes
    isSingle = ortholog_group_df.apply(get_single_copy_genes, axis=1, args = (numGenomes-gap,))

    singleCopyOrhologGroup =  ortholog_group_tag[isSingle]
    remainingOrthologGroup =  ortholog_group_tag[~isSingle]
    print("all: " + str(len(ortholog_group_df)))
    print("single almost core genes: " + str(len(singleCopyOrhologGroup)))
    print("others: " + str(len(remainingOrthologGroup)))
    
    original_index_target = singleCopyOrhologGroup.index.to_series()
    original_index_target.index = range(len(original_index_target))

    singleCopyOrhologTag = singleCopyOrhologGroup.copy()
    remainingOrthologTag = remainingOrthologGroup.copy()
    # change col and index names    
    singleCopyOrhologTag.index = range(len(singleCopyOrhologTag))
    remainingOrthologTag.index = range(len(singleCopyOrhologTag), len(singleCopyOrhologTag)+len(remainingOrthologTag))
    
    singleCopyOrhologTagRenamed = singleCopyOrhologTag.apply(convert_asterisk_to_hyphen, axis=1)
    RemainingOrthologTagRenamed = remainingOrthologTag.apply(convert_asterisk_to_hyphen, axis=1)

    # save locus tags
    ortholog_group_tag.to_csv(locusTag_fName,sep="\t")
    singleCopyOrhologTagRenamed.to_csv(single_locusTag_fName,sep="\t")
    RemainingOrthologTagRenamed.to_csv(remain_locusTag_fName, sep="\t")

    
    # convert from locusTag to start
    print ("Start conversion from locusTag to gene strat position")
    singleCopyOrhologStartPosition = singleCopyOrhologTagRenamed.copy()
    singleCopyOrhologStartPosition = setPositionFromDf(gb_df, singleCopyOrhologStartPosition)

    
    if(isHp72):
    #select first reference species; 
        sample_info_fName = "sample_info.tsv"
        sample_df = pd.read_csv(sample_info_fName, sep="\t")
    
        ref = "P12"
        acc = searchDf(sample_df, ref, 1).iloc[0,0]    
        singleCopyOrhologStartPositionSorted = singleCopyOrhologStartPosition.sort_values(by=acc)
        singleCopyOrhologStartPositionSorted
        # save index
        first_sorted_index_target = singleCopyOrhologStartPositionSorted.index.to_series()
        first_sorted_index_target.index = range(len(first_sorted_index_target))
    
        orders = pd.concat([original_index_target, first_sorted_index_target], axis=1)
        orders.to_csv(reorders_fName, sep="\t", index=None, header=None)
        
        singleCopyOrhologStartPositionSorted.index = range(len(singleCopyOrhologStartPositionSorted))
        singleCopyOrhologIndex = singleCopyOrhologStartPositionSorted.apply(sortAndConvert2Index).fillna(-1).astype(int)
        singleCopyOrhologIndex.to_csv(gene_order_fName, sep="\t", index=None, header=None)

        # remove Aklavik117
        removeAcc = "NC_019563.1"
        singleCopyOrhologIndex_Removed=singleCopyOrhologIndex.drop(columns=removeAcc)
        singleCopyOrhologIndex_Removed.to_csv(gene_order_rm_fName, sep="\t", index=None, header=None)

    else:
        singleCopyOrhologStartPositionSorted = singleCopyOrhologStartPosition
        # save index
        first_sorted_index_target = singleCopyOrhologStartPositionSorted.index.to_series()
        first_sorted_index_target.index = range(len(first_sorted_index_target))
    
        orders = pd.concat([original_index_target, first_sorted_index_target], axis=1)
        orders.to_csv(reorders_fName, sep="\t", index=None, header=None)
        
        singleCopyOrhologStartPositionSorted.index = range(len(singleCopyOrhologStartPositionSorted))
        singleCopyOrhologIndex = singleCopyOrhologStartPositionSorted.apply(sortAndConvert2Index).fillna(-1).astype(int)
        singleCopyOrhologIndex.to_csv(gene_order_fName, sep="\t", index=None, header=None)
       

    os.system("java program.SortByRevfinal " + dir + "/ " + dir + "/" + gene_order_fName + " " + tag)        

        
if __name__ == '__main__':
    dir="G:/マイドライブ/1_study/6_pylori/test5sp"
    #dir="G:/マイドライブ/1_study/6_pylori/Hp73"
    #dir="G:/マイドライブ/1_study/6_pylori/NAG"
    #dir="G:/マイドライブ/1_study/6_pylori/others"
    tag = "test5sp"   
    gap = 0

    main(dir, tag, gap)