# -*- coding: utf-8 -*-
"""
Created on Thu Sep 26 13:17:54 2019

Convert SortByRev results

@author: tipputa
"""

import os, sys
import pandas as pd
import numpy as np
import json
from Bio import SeqIO 
import collections as cl
import math

def getMap(df, key, value):
    return df.set_index(key)[value].to_dict()


def applyLocusTagDic_wrap(series, dic):
    ids = [series.iloc[0], series.iloc[1]]
    series.iloc[2:].apply(applyLocusTagDic, dic=dic, idList = ids)
    
def applyLocusTagDic(s, dic, idList):
    if(s != "-"):
        for i in s.split(","):
            dic[i] = idList

def applyConsensusIdDic(series, dic):
    cId = series.iloc[1]
    target = series.iloc[2:]
    locusTagList = []
    res = {}
    accTagList = target[target!="-"].index.tolist()
    series.iloc[2:].apply(string2list, tagList = locusTagList)
    res["count"] = len(locusTagList)
    res["locusTag"] = locusTagList
    res["acc"] = accTagList
    dic[cId] = res
    return "oK"    

    
def string2list(s, tagList):
    if(s != "-"):
        tagList += s.split(",")
            
def getGenomeFromFiles(gbFile, outputFastaDir, buffer, acc_sp_dic, genome_rotation_summary):
    record = SeqIO.read(gbFile, "genbank")
    rId = record.id
    length = len(record.seq)
    if not rId in acc_sp_dic:
        print("Error\nFile: " + gbFile + "\n" + rId + " is not target genebank file. please check it")
        
    sp = acc_sp_dic[rId]
    buffer.append([sp, rId, length])
    fileName = outputFastaDir + "/" + rId + ".fa"
    rotation_info = genome_rotation_summary[genome_rotation_summary.iloc[:,0]==sp]

    if len(rotation_info) != 1:    
        with open(fileName, "w") as f:
            f.write(str(record.seq) + "\n")
            
    else:
        if(rotation_info.iloc[0,2] == 1):
            #flip
            s = rotation_info.iloc[0,1]
            tmpSeq = record.seq.reverse_complement()
            tmpSeq1 = tmpSeq[0:length-s]
            tmpSeq2 = tmpSeq[length-s:length]
            with open(fileName, "w") as f:
                f.write(str(tmpSeq2) + str(tmpSeq1) + "\n")
        else:
            s = rotation_info.iloc[0,1]            
            tmpSeq = record.seq
            tmpSeq1 = tmpSeq[0:s]
            tmpSeq2 = tmpSeq[s:length]
            with open(fileName, "w") as f:
                f.write(str(tmpSeq2) + str(tmpSeq1) + "\n")

        
def createGenomeFiles(gbDir, outputFastaDir, acc_sp_dic, genome_rotation_summary):
    files = os.listdir(gbDir)
    NumGB = len([file for file in files if file.endswith(".gb")  or file.endswith('.gbk')])
    LoopCounter = 1
    buffer = []
    
    for file in files:
        if file.endswith(".gb") or file.endswith('.gbk'): 
            print("Reading: " + file + "  "+ str(LoopCounter) + "/" + str(NumGB))
            LoopCounter = LoopCounter + 1
            getGenomeFromFiles(gbDir + file, outputFastaDir, buffer, acc_sp_dic, genome_rotation_summary)
    return pd.DataFrame(buffer)

def main(dir, tag, gap):    
    os.chdir(dir)
    single_locusTag_fName = "SingleCopy_AlmostConserved_LocusTag_minus" + str(gap) + ".tsv"
    remain_locusTag_fName = "Remaining_LocusTag_minus" + str(gap) + ".tsv"
    cons_order_fName = "consensusGeneOrder_" + tag +".txt"
    reorders_fName = "reorder_info.tsv"
    gbSummary_fName = dir + "/gbSummary.tsv" 
    accID_genomeSize_fName = "AccID_GenomeSize.tsv"    
    outputFasta = dir + "/genome/"
    gbDir = dir + "/gb/"    
    sample_info_fName = "sample_info.tsv"
    sample_df = pd.read_csv(sample_info_fName, sep="\t")

    all_locusTag_fName = "all_ortholog_locusTag.tsv"
    
    cons_order_df = pd.read_csv(cons_order_fName, sep="\t", header=None)
    original_orders = pd.read_csv(reorders_fName, sep="\t", header=None)
    single_lTag = pd.read_csv(single_locusTag_fName, sep="\t")    
    remain_lTag = pd.read_csv(remain_locusTag_fName, sep="\t")
    gb_df = pd.read_csv(gbSummary_fName, sep="\t", engine="python")

    m1 = getMap(cons_order_df, 1, 0)    
    target = original_orders.iloc[:,1].sort_values()
    tmp2 = target.index.to_series()
    tmp3 = tmp2.map(m1)
    tmp3.index = range(len(tmp3))
    single_lTag.iloc[:,0]
    single_lTag.iloc[:,0] = tmp3
    single_locusTag = pd.concat([tmp3, single_lTag], axis=1)
    
    single_locusTag.iloc[:3,:]
    
    all_locusTags = pd.concat([single_locusTag, remain_lTag]).fillna("-1")
    c = all_locusTags.columns.to_series()
    c[0] = "GeneOrder"
    c[1] = "ConsensusID"
    all_locusTags.columns = c
    
    all_locusTags_df = all_locusTags.sort_values(by="ConsensusID")    
    all_locusTags_df.index = range(len(all_locusTags_df))
    all_locusTags_df["ConsensusID"] = "ID" + all_locusTags_df["ConsensusID"].astype(str).str.zfill(4)
    all_locusTags_df.iloc[:,0] = all_locusTags_df.iloc[:,0].astype(int)    

    all_locusTags_df.to_csv(all_locusTag_fName, sep="\t", index=None)
    
    all_locusTags_df = pd.read_csv(all_locusTag_fName, sep="\t")
    
    # genome rotation    
    geneome_rotation_fName = "genome_rotation_" + tag + ".txt"
    genomeRotation_df = pd.read_csv(geneome_rotation_fName, sep="\t")
    
    buf = []
    for i in range(np.max(genomeRotation_df["Species"])+1):
        target = genomeRotation_df[genomeRotation_df.iloc[:,0] == i]
        l = len(target)    
        if(l == 1):
            print(str(i) + ": ok")
        elif(l == 2):
            locusTag = all_locusTags_df[all_locusTags_df["GeneOrder"]==target["Start"].iloc[0]].iloc[0, i + 2]
            minGene_Pos = gb_df[gb_df["locusTag"]==locusTag].iloc[0, 6]
            buf.append((i, minGene_Pos, 1))
        elif(l == 3):
            locusTag = all_locusTags_df[all_locusTags_df["GeneOrder"]==target["Start"].iloc[1]].iloc[0, i + 2]
            minGene_Pos = gb_df[gb_df["locusTag"]==locusTag].iloc[0, 5]
            buf.append((i, minGene_Pos, 0))
        else:
            print("problem" + str(l))

    genome_rotation_summary = pd.DataFrame(buf)
    genome_rotation_summary.columns = ["Species", "Start", "Flip"]
    
    columns = all_locusTags_df.columns.to_series()[2:]   
    sp_acc_dic = {}
    acc_sp_dic = {}
    i = 0
    for c in columns:
        acc_sp_dic[c] = i
        sp_acc_dic[i] = c
        i += 1
    
    # rotate fasta files
    genome_df = createGenomeFiles(gbDir, outputFasta, acc_sp_dic, genome_rotation_summary)
            
    genome_df.columns = ["Species", "Acc", "GenomeSize"]
    genome_df.to_csv(accID_genomeSize_fName, sep="\t", index=None)
    genome_df = pd.read_csv(accID_genomeSize_fName, sep="\t")

    gb_df_rotate = rotateGenes(genome_rotation_summary, genome_df, gb_df)
    gb_df_rotate = addGeneAngle(genome_rotation_summary, genome_df, gb_df_rotate)
    gb_df_rotate.to_csv("tmp_dataset.tsv", sep="\t", index=None)
    gb_df_rotate = gb_df_rotate.fillna("None")
    locusTag_consensus = {}
    consensus_locusTag = {}    
    locusTag_rotatedAngle = getMap(gb_df_rotate, "locusTag", "start_rotated_angle")

    all_locusTags_df.apply(applyLocusTagDic_wrap, axis=1, dic=locusTag_consensus)
    all_locusTags_df.apply(applyConsensusIdDic, axis=1, dic=consensus_locusTag)

    for key in consensus_locusTag.keys():
        v = consensus_locusTag[key]
        tags = v["locusTag"]
        angles = []
        for i in tags:
            angles.append(locusTag_rotatedAngle[i])
         
        print(angles)
        cons = calcEachConsensus(angles)
        v["angle"] = cons
    
    res_json =setJson(genome_df, sample_df, gb_df_rotate, locusTag_consensus, consensus_locusTag)
    json_fName = dir + "/result_" + tag + ".json"
    writeJson(json_fName, res_json)

    json_fName = dir + "/consensusId_" + tag + ".json"    
    writeJson(json_fName, consensus_locusTag)
    

    json_fName = dir + "/locusTag_" + tag + ".json"    
    lTag_json = setLocusTagJson(genome_df, gb_df_rotate, locusTag_consensus, consensus_locusTag)
    writeJson(json_fName, lTag_json)
    
def calcConsensusGsize(genome_df):
    return round(np.mean(genome_df["GenomeSize"]))
    
def writeJson(fname, jsonRes):
    with open(fname, "w") as f:
        json.dump(jsonRes, f, indent=4)


        
def setJson(genome_df, sample_df, gb_df, locusTag_consensus, consensus_locusTag):
    res = cl.OrderedDict()
    res["consensus_genome_size"] = int(calcConsensusGsize(genome_df))
    res["cluster_info"] = []
    res["each_genome_info"] = []
    for i in range(len(genome_df)):
        tmp = cl.OrderedDict()
        genes = []
        acc = genome_df.iloc[i, 1]
        target_genes = gb_df[gb_df.iloc[:,0] == acc]
        target_sample = sample_df[sample_df.iloc[:,0] == acc]
        step_size = int(genome_df.iloc[i, 2]) / (2 * math.pi)
        
        tmp["strain"] = target_sample.iloc[0,1]
        tmp["acc"] = acc
        tmp["genome_size"] = int(genome_df.iloc[i, 2])
        tmp["order"] = int(i)
        for j in range(len(target_genes)):
            gene = cl.OrderedDict()
            ltag = target_genes.iloc[j, 1]
            gene["locusTag"] = ltag
            gene["feature"] = target_genes.iloc[j, 2]
            gene["gene"] = target_genes.iloc[j, 3]
            
            #gene["start"] = int(target_genes.iloc[j, 5])
            #gene["end"] = int(target_genes.iloc[j, 6])
            gene["start_rotated"] = int(target_genes.iloc[j, 10])
            gene["end_rotated"] = int(target_genes.iloc[j, 11])
            gene["strand"] = int(target_genes.iloc[j, 12])
            gene["start_rotated_rad"] = float(target_genes.iloc[j,10] / step_size)
            gene["end_rotated_rad"] = float(target_genes.iloc[j,11] / step_size)
            if ltag in locusTag_consensus:
                gene["gene_order"] = int(locusTag_consensus[ltag][0])
                gene["consensusId"] = locusTag_consensus[ltag][1]
                gene["angle"] = int(consensus_locusTag[locusTag_consensus[ltag][1]]["angle"])
                # should be removed
                gene["sameGroup"] = consensus_locusTag[locusTag_consensus[ltag][1]]["locusTag"]
            else:
                gene["gene_order"] = -1
                gene["consensusId"] = -1
                gene["angle"] = -1
                
            genes.append(gene)
        tmp["genes"] = genes                
        res["each_genome_info"].append(tmp)                
    return res

def setLocusTagJson(genome_df, gb_df, locusTag_consensus, consensus_locusTag):
    genes = cl.OrderedDict()
    for i in range(len(genome_df)):
        acc = genome_df.iloc[i, 1]
        target_genes = gb_df[gb_df.iloc[:,0] == acc]
        step_size = int(genome_df.iloc[i, 2]) / (2 * math.pi)
        for j in range(len(target_genes)):
            gene = cl.OrderedDict()
            ltag = target_genes.iloc[j, 1]
            gene["acc"] = acc
            gene["feature"] = target_genes.iloc[j, 2]
            gene["gene"] = target_genes.iloc[j, 3]
            
            #gene["start"] = int(target_genes.iloc[j, 5])
            #gene["end"] = int(target_genes.iloc[j, 6])
            gene["start_rotated"] = int(target_genes.iloc[j, 10])
            gene["end_rotated"] = int(target_genes.iloc[j, 11])
            gene["strand"] = int(target_genes.iloc[j, 12])
            gene["start_rotated_rad"] = float(target_genes.iloc[j,10] / step_size)
            gene["end_rotated_rad"] = float(target_genes.iloc[j,11] / step_size)
            if ltag in locusTag_consensus:
                gene["gene_order"] = int(locusTag_consensus[ltag][0])
                gene["consensusId"] = locusTag_consensus[ltag][1]
                gene["angle"] = int(consensus_locusTag[locusTag_consensus[ltag][1]]["angle"])
                # should be removed
                gene["sameGroup"] = consensus_locusTag[locusTag_consensus[ltag][1]]["locusTag"]
            else:
                gene["gene_order"] = -1
                gene["consensusId"] = -1
                gene["angle"] = -1
                
            genes[ltag] = gene
    return genes
            

def changeGenomicPosition(pos, gsize, minGene_pos, flip):
    if flip == 1:
        difsize = gsize - 1 - minGene_pos
        tmp = pos + difsize
        tmp[tmp > gsize-1] = tmp[tmp > gsize -1] - (gsize)
        return (tmp - (gsize -1)) * -1 
                
    else:
        difsize = minGene_pos
        tmp = pos - minGene_pos
        tmp[tmp < 0] = gsize - tmp[tmp < 0]
        return tmp

def rotateGenes(genome_rotation_summary, genome_df, gb_df_rotate):    
    new_start = pd.Series()
    new_end = pd.Series()
    new_strand = pd.Series()    
    for i in range(len(genome_df)):
        acc = genome_df[genome_df["Species"] == i].iloc[0,1]
        gb_target_s = gb_df_rotate[gb_df_rotate.iloc[:,0] == acc]["start"]
        gb_target_e = gb_df_rotate[gb_df_rotate.iloc[:,0] == acc]["end"]
        gb_target_strand = gb_df_rotate[gb_df_rotate.iloc[:,0] == acc]["strand"]
        target = genome_rotation_summary[genome_rotation_summary["Species"] == i]
        
        if(len(target) == 1):
            sp = i
            minPos = target.iloc[0,1]
            flip = target.iloc[0,2]
            gsize = genome_df[genome_df["Species"] == sp].iloc[0,2]
            acc = genome_df[genome_df["Species"] == sp].iloc[0,1]
            print(str(gsize) + " " + acc + " " + str(flip))
            new_s = changeGenomicPosition(gb_target_s, gsize, minPos, flip)
            new_e = changeGenomicPosition(gb_target_e, gsize, minPos, flip)
            if(flip == 1):
                gb_target_strand = gb_target_strand * -1
                new_start = pd.concat([new_start, new_e])
                new_end = pd.concat([new_end, new_s])
                new_strand = pd.concat([new_strand, gb_target_strand])
            else:
                new_start = pd.concat([new_start, new_s])
                new_end = pd.concat([new_end, new_e])
                new_strand = pd.concat([new_strand, gb_target_strand])
                
        else:
            new_start = pd.concat([new_start, gb_target_s])
            new_end = pd.concat([new_end, gb_target_e])
            new_strand = pd.concat([new_strand, gb_target_strand])
    newDf = pd.concat([gb_df_rotate, new_start, new_end, new_strand], axis=1)
    newCol = gb_df_rotate.columns.tolist()
    newCol.append("start_rotated")
    newCol.append("end_rotated")
    newCol.append("strand_rotated")
    newDf.columns = newCol
    return newDf

def addGeneAngle(genome_rotation_summary, genome_df, gb_df_rotate):    
    new_start = pd.Series()
    new_end = pd.Series()
    for i in range(len(genome_df)):
        acc = genome_df[genome_df["Species"] == i].iloc[0,1]
        gsize = genome_df[genome_df["Species"] == i].iloc[0,2]
        step = gsize / 360
        gb_target_s = gb_df_rotate[gb_df_rotate.iloc[:,0] == acc]["start_rotated"]
        gb_target_e = gb_df_rotate[gb_df_rotate.iloc[:,0] == acc]["end_rotated"]
        newStart = (gb_target_s / step).astype(int)
        newEnd = (gb_target_e / step).astype(int)
        new_start = pd.concat([new_start, newStart])
        new_end = pd.concat([new_end, newEnd])
    newDf = pd.concat([gb_df_rotate, new_start, new_end], axis=1)
    newCol = gb_df_rotate.columns.tolist()
    newCol.append("start_rotated_angle")
    newCol.append("end_rotated_angle")
    newDf.columns = newCol
    return newDf

def calcEachConsensus(angles): # それぞれのclusterごとに、consensusを計算、0-360と-180~180の両方。全て"-"の場合error.
    def calcSummary(tmp_num, std_threathold = 5, median_range = 10): # 各clusterのaverage, std, median, medianMean, Finalを出力
        count = len(tmp_num)
        tmp_mean = round(np.mean(tmp_num))
        tmp_std = round(np.std(tmp_num),2)
        if tmp_std <= std_threathold:
            return tmp_mean
        else:
            med = int(count / 2 + 0.5) - 1
            sorted = tmp_num[tmp_num.argsort(order=False)]
            tmp_median = sorted[med]
            return int(np.mean(tmp_num[(tmp_num < tmp_median + median_range) & (tmp_num > tmp_median - median_range)])+0.5)
    
    def oppositeDirection(tmp_num):
        tmp_num[tmp_num > 180] -= 360
        return(tmp_num)
        
    def correctOppositeDirection(tmp_num):
        tmp_num[tmp_num < 0] += 360
        return(tmp_num)
    
    tmp_len = len(angles)
    tmp_num = pd.Series(angles)
    if tmp_len > 1:
        new_angle = calcSummary(tmp_num)
        new_angle2 = calcSummary(oppositeDirection(tmp_num))
        if new_angle < new_angle2:
            return correctOppositeDirection(new_angle2)
        else:
            return new_angle
    else:
        print("Error : there are not values, please check input file.")
        return -1

def calcConsensus(self, df_num):
    tmp_out = []
    df_tmp = df_num.ix[:,self.cols[0:self.num_col]]
    for row in range(0,self.num_row):
        tmp = df_tmp.ix[row]
        tmp_out.append(self.calcEachConsensus(tmp))

    out = pd.DataFrame(tmp_out)
    out.columns = ["Mean","Std","Median","MedianMean","Consensus","Count"]
    df_cons = pd.concat([df_tmp,out],axis=1)
    return(df_cons)
    
if __name__ == '__main__':

    dir="G:/マイドライブ/1_study/6_pylori/test5sp"
    #dir="G:/マイドライブ/1_study/6_pylori/Hp73"
    #dir="G:/マイドライブ/1_study/6_pylori/NAG"
    #dir="G:/マイドライブ/1_study/6_pylori/others"
    tag = "test5sp"   
    gap = 0

    dir="G:/マイドライブ/1_study/6_pylori/Hp73"
    tag = "Hp72"
    gap=1

    main(dir, tag, gap)

        
