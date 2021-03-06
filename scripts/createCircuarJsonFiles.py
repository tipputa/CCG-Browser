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
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster



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

def applyConsensusIdFasta(series, gb_df, proteinDir):
    cId = series.iloc[1]
    locusTagList = []
    series.iloc[2:].apply(string2list, tagList = locusTagList)
    proteinFasta = getProteinSeqFromlocusTag(gb_df, locusTagList)
    with open(proteinDir + "/" + cId + ".fas", "w") as f:
        f.write(proteinFasta)    
    return "fin: " + cId
    
def apply_consensusID_proteinFasta(series, locusTag_protein_dic, proteinDir):
    cId = series.iloc[1]
    locusTagList = []
    series.iloc[2:].apply(string2list, tagList = locusTagList)
    proteinFasta = get_protein_from_locusTag(locusTag_protein_dic, locusTagList)
    with open(proteinDir + "/" + cId + ".fas", "w") as f:
        f.write(proteinFasta)    
    return "fin: " + cId


def get_protein_from_locusTag(dic, locusTagList):   
    proteinList = [">" + locusTag + "\n" + dic[locusTag] for locusTag in locusTagList]         
    return "\n".join(proteinList)


def getProteinSeqFromlocusTag(gb_df, locusTagList):   
    proteinList = [">" + locusTag + "\n" + gb_df[gb_df["locusTag"]==locusTag]["prot"].iloc[0] for locusTag in locusTagList]         
    return "\n".join(proteinList)
    
def string2list(s, tagList):
    if(s != "-"):
        tagList += s.split(",")
            
def getGenomeFromFiles(gbFile, outputFastaDir, buffer, acc_sp_dic, genome_rotation_summary):
    record = SeqIO.read(gbFile, "genbank")
    rId = record.id
    length = len(record.seq)
    if not rId in acc_sp_dic:
        print("Error\nFile: " + gbFile + "\n" + rId + " is not target genebank file. please check it")
        return
        
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
        target_genes = gb_df[gb_df["acc"] == acc]
        target_sample = sample_df[sample_df.iloc[:,0] == acc]
        step_size = int(genome_df.iloc[i, 2]) / (2 * math.pi)
        
        tmp["strain"] = target_sample.iloc[0,1]
        tmp["acc"] = acc
        tmp["genome_size"] = int(genome_df.iloc[i, 2])
        tmp["order"] = int(i)
        for j in range(len(target_genes)):
            gene = cl.OrderedDict()
            ltag = target_genes.iloc[j, 2]
            gene["locusTag"] = ltag
            gene["feature"] = target_genes.iloc[j, 3]
            gene["gene"] = target_genes.iloc[j, 4]

            gene["start_rotated"] = int(target_genes.iloc[j, 11])
            gene["end_rotated"] = int(target_genes.iloc[j, 12])
            gene["strand"] = int(target_genes.iloc[j, 13])
            gene["start_rotated_rad"] = float(target_genes.iloc[j,11] / step_size)
            gene["end_rotated_rad"] = float(target_genes.iloc[j,12] / step_size)
            if ltag in locusTag_consensus:
                gene["gene_order"] = int(locusTag_consensus[ltag][0])
                gene["consensusId"] = locusTag_consensus[ltag][1]
                if consensus_locusTag[locusTag_consensus[ltag][1]]["angle"] == None:
                    gene["angle"] = -1;
                else:                    
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

def set_min_json(genome_df, sample_df, gb_df, locusTag_consensus, consensus_locusTag, orders=None, rotated_info = None):
    res = cl.OrderedDict()
    res["consensus_genome_size"] = int(calcConsensusGsize(genome_df))
    res["clusters"] = []
    res["genomes"] = []
    for i in range(len(genome_df)):
        tmp = cl.OrderedDict()
        genes = []
        acc = genome_df.iloc[i, 1]
        target_genes = gb_df[gb_df["acc"] == acc]
        target_sample = sample_df[sample_df.iloc[:,0] == acc]
        step_size = int(genome_df.iloc[i, 2]) / (2 * math.pi)
        
        tmp["id"] = acc
        tmp["name"] = target_sample.iloc[0,1]
        tmp["genome_size"] = int(genome_df.iloc[i, 2])
        if orders:
            tmp["order"] = orders[i]
        else:
            tmp["order"] = int(i)
        
        if rotated_info:
            tmp["flipped"] = rotated_info[i][0]
            tmp["rotated_angle"] = rotated_info[i][1]
            tmp["rotated_length"] = int(rotated_info[i][1] / 359 * int(genome_df.iloc[i, 2]))
            
        for j in range(len(target_genes)):
            gene = cl.OrderedDict()
            ltag = target_genes.iloc[j, 2]
            gene["locusTag"] = ltag
            
            gene["start"] = int(target_genes.iloc[j, 6])
            gene["end"] = int(target_genes.iloc[j, 7])
            gene["start_rotated"] = int(target_genes.iloc[j, 11])
            gene["end_rotated"] = int(target_genes.iloc[j, 12])
            gene["strand"] = int(target_genes.iloc[j, 13])
            gene["start_rotated_rad"] = float(target_genes.iloc[j,11] / step_size)
            gene["end_rotated_rad"] = float(target_genes.iloc[j,12] / step_size)
            if ltag in locusTag_consensus:
                gene["consensusId"] = locusTag_consensus[ltag][1]
                if consensus_locusTag[locusTag_consensus[ltag][1]]["angle"] == None:
                    gene["angle"] = -1;
                else:                    
                    gene["angle"] = int(consensus_locusTag[locusTag_consensus[ltag][1]]["angle"])
            else:
                gene["gene_order"] = -1
                gene["consensusId"] = -1
                gene["angle"] = -1
                
            genes.append(gene)
        tmp["genes"] = genes                
        res["genomes"].append(tmp)                
    return res

def setLocusTagJson(genome_df, gb_df, locusTag_consensus, consensus_locusTag):
    genes = cl.OrderedDict()
    for i in range(len(genome_df)):
        acc = genome_df.iloc[i, 1]
        target_genes = gb_df[gb_df["acc"] == acc]
        step_size = int(genome_df.iloc[i, 2]) / (2 * math.pi)
        for j in range(len(target_genes)):
            gene = cl.OrderedDict()
            ltag = target_genes.iloc[j, 2]
            gene["acc"] = acc
            gene["feature"] = target_genes.iloc[j, 3]
            gene["gene"] = target_genes.iloc[j, 4]
            
            #gene["start"] = int(target_genes.iloc[j, 5])
            #gene["end"] = int(target_genes.iloc[j, 6])
            gene["start_rotated"] = int(target_genes.iloc[j, 11])
            gene["end_rotated"] = int(target_genes.iloc[j, 12])
            gene["strand"] = int(target_genes.iloc[j, 13])
            gene["start_rotated_rad"] = float(target_genes.iloc[j,11] / step_size)
            gene["end_rotated_rad"] = float(target_genes.iloc[j,12] / step_size)
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
        tmp[tmp < 0] += gsize
        return tmp

def rotateGenomicPosition(pos, gsize, diff, flip):
    if flip == 1:
        tmp = gsize - pos + diff
        tmp[tmp < 0] += gsize
        tmp[tmp >= gsize] -= gsize
        return tmp 
                
    else:
        tmp = pos + diff
        tmp[tmp >= gsize] -= gsize
        return tmp


def rotateGenes(genome_rotation_summary, genome_df, gb_df_rotate):    
    new_start = pd.Series()
    new_end = pd.Series()
    new_strand = pd.Series()    
    for i in range(len(genome_df)):
        acc = genome_df[genome_df["Species"] == i].iloc[0,1]
        gb_target_s = gb_df_rotate[gb_df_rotate["acc"] == acc]["start"]
        gb_target_e = gb_df_rotate[gb_df_rotate["acc"] == acc]["end"]
        gb_target_strand = gb_df_rotate[gb_df_rotate["acc"] == acc]["strand"]
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

def addGeneAngle(genome_df, gb_df_rotate):    
    new_start = pd.Series()
    new_end = pd.Series()
    for i in range(len(genome_df)):
        acc = genome_df[genome_df["Species"] == i].iloc[0,1]
        gsize = genome_df[genome_df["Species"] == i].iloc[0,2]
        step = int(gsize / 359 + 0.5)
        gb_target_s = gb_df_rotate[gb_df_rotate["acc"] == acc]["start_rotated"]
        gb_target_e = gb_df_rotate[gb_df_rotate["acc"] == acc]["end_rotated"]
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
            return [tmp_mean, tmp_std]
        else:
            med = int(count / 2 + 0.5) - 1
            tmp_sorted = tmp_num.sort_values()
            tmp_sorted.index = range(len(tmp_sorted))
            tmp_median = tmp_sorted[med]
            return [int(np.mean(tmp_num[(tmp_num < tmp_median + median_range) & (tmp_num > tmp_median - median_range)])+0.5), tmp_std]
    
    def oppositeDirection(tmp_num):
        tmp_num[tmp_num > 180] -= 360
        return(tmp_num)
        
    def correctOppositeDirection(tmp_num):
        if tmp_num < 0:
            return tmp_num + 360
        else:
           return(tmp_num)
    
    tmp_len = len(angles)
    tmp_num = pd.Series(angles)
    if tmp_len > 1:
        new_angle = calcSummary(tmp_num)
        new_angle2 = calcSummary(oppositeDirection(tmp_num))
        if new_angle[1] > new_angle2[1]:
            return correctOppositeDirection(new_angle2[0])
        else:
            return new_angle[0]
    else:
        print("Error : there are not values, please check input file.")
        return angles[0]

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
    
def main(dir, tag, gap):    
    os.chdir(dir)
    gbSummary_fName = dir + "/gb_summary.tsv" 
    accID_genomeSize_fName = "AccID_GenomeSize.tsv"    
    sample_info_fName = "sample_info.tsv"
    sample_df = pd.read_csv(sample_info_fName, sep="\t")

    all_locusTag_fName = "all_ortholog_locusTag.tsv"    

    gb_df = pd.read_csv(gbSummary_fName, sep="\t", engine="python")     
    genome_df = pd.read_csv(accID_genomeSize_fName, sep="\t")    
    all_locusTags_df = pd.read_csv(all_locusTag_fName, sep="\t")
    if(tag=="Hp72"):
        removeAcc = "NC_019563.1"
        all_locusTags_df=all_locusTags_df.drop(columns=removeAcc)
    
    locusTag_consensus = {}
    consensus_locusTag = {}

    all_locusTags_df.apply(applyLocusTagDic_wrap, axis=1, dic=locusTag_consensus)
    all_locusTags_df.apply(applyConsensusIdDic, axis=1, dic=consensus_locusTag)    

    gb_df_rotate = gb_df.fillna("None")
    gb_df_rotate["start_rotated"] = gb_df_rotate["start"]
    gb_df_rotate["end_rotated"] = gb_df_rotate["end"]
    gb_df_rotate["strand_rotated"] = gb_df_rotate["strand"]
    gb_df_rotate = addGeneAngle(genome_df, gb_df_rotate)

    deviations = []
    locusTag_rotatedAngle = getMap(gb_df_rotate, "locusTag", "start_rotated_angle")
    calc_consensus_angle(consensus_locusTag, locusTag_rotatedAngle)
    deviations.append(confirm_strand_direction(genome_df, gb_df_rotate, locusTag_consensus, consensus_locusTag, 10))
    
    locusTag_rotatedAngle = getMap(gb_df_rotate, "locusTag", "start_rotated_angle")
    calc_consensus_angle(consensus_locusTag, locusTag_rotatedAngle)
    deviations.append(confirm_strand_direction(genome_df, gb_df_rotate, locusTag_consensus, consensus_locusTag, 10))

    locusTag_rotatedAngle = getMap(gb_df_rotate, "locusTag", "start_rotated_angle")
    calc_consensus_angle(consensus_locusTag, locusTag_rotatedAngle)
    deviations.append(confirm_strand_direction(genome_df, gb_df_rotate, locusTag_consensus, consensus_locusTag, 3))
        
    locusTag_rotatedAngle = getMap(gb_df_rotate, "locusTag", "start_rotated_angle")
    calc_consensus_angle(consensus_locusTag, locusTag_rotatedAngle)

    buf = []
    for i in range(len(deviations[0])):
        strand = deviations[0][i][1] + deviations[1][i][1] + deviations[2][i][1] % 2
        dev = deviations[0][i][2] + deviations[1][i][2]  + deviations[2][i][2]
        if dev >= 360:
            print(dev)
            rate = int(dev / 359)
            dev -= 359 * rate
        buf.append((strand, dev))
    
    genome_rotated_info = buf    

    gb_df_rotate = gb_df.fillna("None")
    gb_df_rotate["start_rotated"] = gb_df_rotate["start"]
    gb_df_rotate["end_rotated"] = gb_df_rotate["end"]
    gb_df_rotate["strand_rotated"] = gb_df_rotate["strand"]
    gb_df_rotate = addGeneAngle(genome_df, gb_df_rotate)

    final_rotate(genome_df, gb_df_rotate, genome_rotated_info)    

    # check
    gb_df_rotate[gb_df_rotate["end_rotated"] - gb_df_rotate["start_rotated"] < 0]


    tmp = gb_df_rotate[gb_df_rotate["acc"]=="NC_017360.1"]
    tmp.to_csv("tmp_dataset.tsv", sep="\t", index=None)

    
    almostCoreGenes = all_locusTags_df[all_locusTags_df["GeneOrder"] > 0]
    locusTag_rotatedAngle = getMap(gb_df_rotate, "locusTag", "start_rotated_angle")
    locusTag_rotatedAngle["-"] = 0
    ClaculatablePositions = almostCoreGenes.iloc[:,2:].apply(convertByMap, dic=locusTag_rotatedAngle)    
    Z = linkage(ClaculatablePositions.T,method="ward",metric="euclidean")
    dend = dendrogram(Z)
    c = fcluster(Z, 4000, criterion="distance")
    orders=dend["leaves"]
    tmp_orders = pd.Series(orders).sort_values()
    order_idx = list(tmp_orders.index)
    
    res_json =set_min_json(genome_df, sample_df, gb_df_rotate, locusTag_consensus, consensus_locusTag, order_idx, genome_rotated_info)
    json_fName = dir + "/result_min_" + tag + ".json"
    writeJson(json_fName, res_json)



    # for DB
    """
    json_fName = dir + "/result_" + tag + ".json"
    res_json = setJson(genome_df, sample_df, gb_df_rotate, locusTag_consensus, consensus_locusTag)
    writeJson(json_fName, res_json)
    """
    
    #save consensus dict res
    buf = []
    for key, val in consensus_locusTag.items():
        for i in val["locusTag"]:
            buf.append((key, i))

    consensusID_locusTag_df = pd.DataFrame(buf)
    consensusID_locusTag_df.to_csv("consensus_df_forDB.tsv", sep="\t", header=None)
    gb_df_tmp = gb_df.fillna("None")
    gb_df_tmp.to_csv("gb_df_forDB.tsv", sep="\t", header=None)

    
    fliped = gb_df_rotate[gb_df_rotate["strand_rotated"] + gb_df_rotate["strand"]==0]
    not_fliped = gb_df_rotate[gb_df_rotate["strand_rotated"] + gb_df_rotate["strand"]!=0]
    
    res_json =set_min_json(genome_df, sample_df, gb_df_rotate, locusTag_consensus, consensus_locusTag)
    json_fName = dir + "/result_min_" + tag + ".json"
    writeJson(json_fName, res_json)

    
    # save protein fasta
    # proteinDir = "consensusProtein"
    # os.makedirs(proteinDir)
    # following program is too late, please use newset one using dic.
    # all_locusTags_df.apply(applyConsensusIdFasta, axis=1, gb_df = gb_df, proteinDir = proteinDir)

    #locusTag_protein_dic = getMap(gb_df, "locusTag", "prot")
    #all_locusTags_df.apply(apply_consensusID_proteinFasta, axis=1, locusTag_protein_dic = locusTag_protein_dic, proteinDir = proteinDir)


def convertByMap(series, dic):
    return series.map(dic)

def final_rotate(genome_df, gb_df_rotate, genome_rotation_info):
    for i in range(len(genome_df)):
        acc = genome_df.iloc[i, :]["Acc"]
        target = gb_df_rotate[gb_df_rotate["acc"]==acc]
        idx = target.index
        min_strand = genome_rotation_info[i][0]
        min_angle = genome_rotation_info[i][1]
        if (min_strand != 0 or min_angle != 0):
            gb_df_rotate.loc[idx,:] = flip_particular_genome(acc, target, genome_df, min_strand, min_angle)


def confirm_strand_direction(genome_df, gb_df_rotate, locusTag_consensus, consensus_locusTag, stepSize = 10):
    deviations = []
    locusTag_start_rotated_angle = getMap(gb_df_rotate, "locusTag", "start_rotated_angle")
    for rows in genome_df.iterrows():
        acc = rows[1]["Acc"]
        target = gb_df_rotate[gb_df_rotate["acc"]==acc]
        idx = target.index
        target_fliped_angles = []
        target_angles = []
        consensus_angles = []
        for i in target["locusTag"]:
            if i in locusTag_consensus and consensus_locusTag[locusTag_consensus[i][1]]["count"] > 70:
                target_angles.append(locusTag_start_rotated_angle[i])
                target_fliped_angles.append((locusTag_start_rotated_angle[i] - 359) * -1)
                consensus_angles.append(consensus_locusTag[locusTag_consensus[i][1]]["angle"])
        min_dev, min_strand, min_angle = search_best_rotation(target_angles, consensus_angles, stepSize)
        if (min_strand != 0 or min_angle != 0):
            gb_df_rotate.loc[idx,:] = flip_particular_genome(acc, target, genome_df, min_strand, min_angle)
        deviations.append([min_dev, min_strand, min_angle])                    
    return deviations

def search_best_rotation(target_angles, consensus_angles, stepSize = 10):
    min_dev = 1000
    min_strand = -1
    min_angle = -1
    for j in range(2):
        for i in range(0, 360, stepSize):
            angles = get_rotated_angles(np.array(target_angles), i, j)
            dev = calc_deviation(angles, consensus_angles)
            if dev < min_dev:
                min_dev = dev
                min_strand = j
                min_angle = i
    return min_dev, min_strand, min_angle
            
def calc_consensus_angle(consensus_locusTag, locusTag_rotatedAngle):
    for key in consensus_locusTag.keys():
        v = consensus_locusTag[key]
        tags = v["locusTag"]
        angles = []
        for i in tags:
            angles.append(locusTag_rotatedAngle[i])
         
        cons = calcEachConsensus(angles)
        v["angle"] = cons

def calc_deviation(target_angles, consensus_angles):
    return np.sqrt(np.sum((np.array(target_angles) - np.array(consensus_angles))**2) / len(target_angles)) 

def get_rotated_angles(angles, diff_angle, flip):
    new_angles = []
    if flip == 0:
        new_angles = angles + diff_angle
    else:
        new_angles = 359 - angles + diff_angle
        
    new_angles[new_angles > 359] -= 360
    new_angles[new_angles < 0] += 360
    return new_angles


def flip_particular_genome(acc, target, genome_df, min_strand, min_angle):
    gsize = int(genome_df[genome_df["Acc"] == acc]["GenomeSize"])
    print(acc + " " + str(gsize))
    tmp_s1 = rotateGenomicPosition(target["start_rotated"], gsize, int(min_angle / 359 * gsize), min_strand)
    tmp_e1 = rotateGenomicPosition(target["end_rotated"], gsize, int(min_angle / 359 * gsize), min_strand)
    if min_strand == 1:
        target.loc[:, "start_rotated"] = tmp_e1
        target.loc[:,"end_rotated"] = tmp_s1
        target.loc[:,"strand_rotated"] = target["strand_rotated"] * -1
    else:
        target.loc[:,"start_rotated"] = tmp_s1
        target.loc[:,"end_rotated"] = tmp_e1

    
    step = int(gsize / 359 + 0.5)
        
    target.loc[:,"start_rotated_angle"] = (target["start_rotated"] / step).astype(int)
    target.loc[:,"end_rotated_angle"] = (target["end_rotated"] / step).astype(int)    

    return target

if __name__ == '__main__':

    dir="G:/マイドライブ/1_study/6_pylori/Hp73"
    gap=1
    tag="Hp72"
    #dir="G:/マイドライブ/1_study/6_pylori/Hp73"
    #dir="G:/マイドライブ/1_study/6_pylori/NAG"
    #dir="G:/マイドライブ/1_study/6_pylori/others"
    #tag = "test5sp"   
    #gap = 0

    #dir="G:/マイドライブ/1_study/6_pylori/HpGP/all"
    #tag = "HpGP"
    #gap=5
    if len(sys.argv)==4:
        dir = sys.argv[1] + "/"
        tag = sys.argv[2]
        gap = sys.argv[3]

    main(dir, tag, gap)

        
