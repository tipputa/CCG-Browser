# -*- coding: utf-8 -*-
"""
Created on Wed Oct 23 13:41:21 2019

@author: tipputa
"""

import os, sys
import pandas as pd
import numpy as np
import json
from Bio import SeqIO 
import collections as cl
import math

def read_mega_file_as_fasta(file_path):
    with open(file_path, "r") as f:
        lines = f.readlines()
        prot_seq = [l.rstrip("\n").replace("#", ">") for l in lines[4:]]                
    return prot_seq

def parse_fasta2tsv(file_path):
    prot_seq = read_mega_file_as_fasta(file_path)
    
    buf = []
    seq = ""
    head = ""
    for l in prot_seq:
        if(len(l) == 0):
            if(len(head) > 0):
                buf.append(head + "\t" + seq)
                head = ""
                seq = ""            
            continue
        if(l.startswith(">")):
            if(len(head) > 0 and len(seq) > 0):
                buf.append(head + "\t" + seq)
                head = ""
                seq = ""   
            head = l.replace(">", "")
        else:
            seq += l
    
    if(len(head) > 0 and len(seq) > 0):
        buf.append(head + "\t" + seq)
    
    return "\n".join(buf)


def parse_fasta2json(file_path):
    prot_seq = read_mega_file_as_fasta(file_path)
    
    dic = {}
    dic["sequences"] = []
    eachDic = {}
    seq = ""
    head = ""
    for l in prot_seq:
        if(len(l) == 0):
            if(len(head) > 0):
                eachDic["name"] = head;
                eachDic["seq"] = seq;
                dic["sequences"].append(eachDic)
                eachDic = {}
                head = ""
                seq = ""            
            continue
        if(l.startswith(">")):
            if(len(head) > 0 and len(seq) > 0):
                eachDic["name"] = head;
                eachDic["seq"] = seq;
                dic["sequences"].append(eachDic)
                eachDic = {}
                head = ""
                seq = ""            
            head = l.replace(">", "")
        else:
            seq += l
    
    if(len(head) > 0 and len(seq) > 0):
        eachDic["name"] = head;
        eachDic["seq"] = seq;
        dic["sequences"].append(eachDic)
    
    return dic

def add_annotations(protein_json, annotation_df):
    return

def write_tsv(tsv, path):
    with open(path, "w") as f:
        f.write(tsv)

def write_json(json_res, output_path):
    with open(output_path, "w") as f:
        json.dump(json_res, f, indent=4)

def convert_mega2tsv(file_path, output_file_path):
    prot_tsv = parse_fasta2tsv(file_path)
    write_tsv(prot_tsv, output_file_path)

def convert_mega2json(file_path, output_file_path, locusTag_acc_dic, acc_annotation_dic):
    prot_json = parse_fasta2json(file_path)
    prot_json["type"] = "prot"
    prot_json["is_annotated"] = "true"
    prot_json["version"] = "1.0"
    counter = 0;
    for i in prot_json["sequences"]:
        i["order"] = counter
        counter += 1
        lTag = i["name"]
        if(lTag in locusTag_acc_dic):
            fname = locusTag_acc_dic[lTag]
            acc = fname.replace(".gbk", "").replace(".gb","").replace("gbff","");
            i["acc"] = acc
            if(acc in acc_annotation_dic):
                i["group"] = acc_annotation_dic[acc]
            else:
                i["group"] = "outgroup"
        else:
            i["acc"] = "outgroup"
            i["group"] = "None"
            
    write_json(prot_json, output_file_path)

def getMap(df, key, value):
    return df.set_index(key)[value].to_dict()

def write_2columns_table(df, c1, c2, output_path):
    df_tmp = df.loc[:,[c1,c2]]
    df_tmp.to_csv(output_path, sep="\t", index=None)    


def main(main_dir, tag):
#    file_path = main_dir + "/tmp1.fas.meg"
#    output_path = main_dir + "/tmp1.align.tsv"
    file_path = main_dir + "/" + tag + ".fas.meg"
    output_path = main_dir + "/"+ tag + ".align.json"
    
    acc_locusTag_path = main_dir + "/all_acc_locusTag.tsv"    
    annotations_path = main_dir + "/sample_info.txt"

    is_ini = False
    if is_ini:
        gb_df = pd.read_csv(main_dir + "/gb_summary.tsv", sep="\t")
        write_2columns_table(gb_df, "fileName", "locusTag", main_dir + "/all_acc_locusTag.tsv")
    
    acc_locusTag = pd.read_csv(acc_locusTag_path, sep="\t")
    acc_annotations = pd.read_csv(annotations_path, sep="\t")
    locusTag_acc_dic = getMap(acc_locusTag, "locusTag", "fileName")
    acc_annotation_dic = getMap(acc_annotations, "Acc", "Tag")
    convert_mega2json(file_path, output_path, locusTag_acc_dic, acc_annotation_dic)
    
if __name__ == '__main__':
    #main_dir = "G:/マイドライブ/1_study/7_genomeBrowser/makeTree/test/output"
    main_dir = "D:/0_VisualStudio/CCG-Browser/examples/msa"
    
    tag = "1093"

    main(main_dir, tag)

    

