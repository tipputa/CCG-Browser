# -*- coding: utf-8 -*-
"""
Created on Tue Sep  3 14:06:36 2019

convert Mehwish style input files into json to visualize by CCG

@author: tipputa
"""

import os, sys
import pandas as pd
import numpy as np
import json

if __name__ == '__main__':
    # set file names
    dir="./Desktop/Hpylori72/"
    inversion_file = "./inversion_list.tsv"
    name_label_file = "./name_label_list.tsv"
    second_order_file = "./second_order_list.tsv"
    breakpoint_file = "./Breakpoints.tsv"
    genome_size_file = "./genome_size.txt"
    ring_group_file = "./ring_groups.txt"
    os.chdir(dir)

    # read files
    inversion_labels_df = pd.read_csv(inversion_file, sep="\t")
    name_labels_df =  pd.read_csv(name_label_file, sep="\t")
    order_labels_df =  pd.read_csv(second_order_file, sep="\t")
    breakpoint_df = pd.read_csv(breakpoint_file, sep="\t")
    genome_size_df = pd.read_csv(genome_size_file, sep="\t", header=None)
    ring_group_df = pd.read_csv(ring_group_file, sep="\t", header=None)
    # get name and label information    
    # labels = {"A": [Acc, name]}
    # accessions = {Acc, ["A", name]}
    labels = {}
    accessions = {}
    for i in name_labels_df.itertuples():
        labels[i.Lable] =  [i.Acession, i.Strains]        
        accessions[i.Acession] = [i.Lable, i.Strains]
  
    # set genome size
    label_genomeSize = {}
    for i in genome_size_df.itertuples():
        label_genomeSize[accessions[i[1]][0]] = i[2]

    # get inversions
    # inversions = {"R1": [start_consensus_gene_number, end_consensus_gene_number]}            
    # label_inversions = {"A": [R1, R2, R3]}
    # label_inversions_numbers = {"A": [[10, 100], [20, 300]]}
    newLabelOrder = []
    inversions = {}
    label_inversions = {}
    label_inversions_numbers = {}
    for i in inversion_labels_df.itertuples():
        inversions[i._1] = i.Inversion.split("-")
        label_arr = i._3.split(", ")
        for l in label_arr:
            if(l in label_inversions):
                label_inversions[l].append(i._1)
                label_inversions_numbers[l].append(i.Inversion.split("-"))
            else:
                newLabelOrder.append(l)
                label_inversions[l] = [i._1]
                label_inversions_numbers[l] = []
                label_inversions_numbers[l].append(i.Inversion.split("-"))
    
    
    # prepare to get gene order information
    # order_header = {"A": "Second_order.1"}    
    num = 0;
    order_header = {}
    pre = "a"
    for i in order_labels_df.columns:
        if(num % 2 == 1):
            order_header[pre] = i
        else:
            pre = i
        num += 1
        
    # get gene order
    # label_geneOrder_Posision = {"A": geneOrder_Posision}
    # label_geneOrder_Posision = "{"genome posiison": "consensus_gene_number"}
    label_geneOrder_Position = {}
    label_Position_geneOrder = {}
    geneOrder_Position = {}
    position_geneorder = {}
    for items in order_header.items():
        geneOrder_Posision = {}
        position_geneorder = {}
        for i in range(0, len(order_labels_df.index)):
            geneOrder_Posision[order_labels_df[items[0]][i]] = order_labels_df[items[1]][i]                        
            position_geneorder[order_labels_df[items[1]][i]] = order_labels_df[items[0]][i]                       
        label_geneOrder_Position[items[0]] = geneOrder_Posision 
        label_Position_geneOrder[items[0]] = position_geneorder
        print(items[0])
    
    
    noreversals = []
    for l in labels:
        if(l not in label_inversions_numbers):            
            noreversals.append(l)

    # noreversals is required
    consensusId_genePosition = {}
    firstLoop = True
    for l in noreversals:
        order = label_Position_geneOrder[l]
        if(firstLoop):
            for i in range(0,972):
                if(i in order):
                    consensusId_genePosition[i] = []
                    consensusId_genePosition[i].append(order[i])
                else:
                    consensusId_genePosition[i] = []
                    consensusId_genePosition[i].append("-")
            firstLoop = False
        else:
            for i in range(0, 972):
                if(i in order):
                    consensusId_genePosition[i].append(order[i])
                else:
                    consensusId_genePosition[i].append("-")
    
    consensusId_geneConsensusPosition = {}
    for i in range(0, 972):
        positions = consensusId_genePosition[i]
        consensusId_geneConsensusPosition[i] = int(np.mean([int(i) for i in positions if i != "-"]) + 0.5)

    no_reversals_genomeSize = []    
    for l in noreversals:
        no_reversals_genomeSize.append(label_genomeSize[l])
    
    consensus_genome_size = np.mean(no_reversals_genomeSize)
    consensus_step = consensus_genome_size / 359
    
    label_inversions_consensusGenomicPosition = {}
    label_skip_large = []
    for label_tmp in label_inversions_numbers.keys():
        tmp_arr = []
        for i in label_inversions_numbers[label_tmp]:
            tmp_i1 = consensusId_geneConsensusPosition[int(i[0])]
            tmp_i2 = consensusId_geneConsensusPosition[int(i[1])]
            tmp_arr.append([tmp_i1, tmp_i2])
        
        for i in range(0,len(tmp_arr)):
            problems = False
            problems2 = False
            for j in range(i + 1, len(tmp_arr)):
                if(int(tmp_arr[i][0]) == int(tmp_arr[j][0]) and int(tmp_arr[i][1]) < int(tmp_arr[j][1])):
                    problems = True
                    break
                if(int(tmp_arr[i][0]) < int(tmp_arr[j][0]) and int(tmp_arr[i][1]) == int(tmp_arr[j][1])):
                    problems = True
                    break
                if(int(tmp_arr[i][1]) < int(tmp_arr[j][0]) and int(tmp_arr[i][0]) == int(tmp_arr[j][1])):
                    problems = True
                    break
                if(int(tmp_arr[i][1]) == int(tmp_arr[j][0]) and int(tmp_arr[i][0]) < int(tmp_arr[j][1])):
                    problems = True
                    break
                if(int(tmp_arr[i][0]) > int(tmp_arr[j][0]) and int(tmp_arr[i][1]) < int(tmp_arr[j][1])):
                    problems2 = True
                    print("case 1")
                if(int(tmp_arr[i][0]) < int(tmp_arr[j][0]) and int(tmp_arr[i][1]) > int(tmp_arr[j][1])):
                    problems2 = True
                    print("case 2")

            if(problems2):
                print("problem 2 " + label_tmp)                    
                label_skip_large.append(label_tmp)

            if(problems):
                if(int(tmp_arr[i+1][1]) - int(tmp_arr[i+1][0]) > consensus_genome_size/2):
                    if(int(tmp_arr[i][1]) - int(tmp_arr[i][0]) < consensus_genome_size/2):
                        print("very bad")
                    print("out: " +label_tmp)
                    print(str(tmp_arr[i][0]) + "\t" + str(tmp_arr[i][1]) + "\t" + str(tmp_arr[i+1][0]) + "\t" + str(tmp_arr[i+1][1]))
                    label_skip_large.append(label_tmp)
                    
                print(label_tmp)
                print(str(tmp_arr[i][0]) + "\t" + str(tmp_arr[i][1]) + "\t" + str(tmp_arr[i+1][0]) + "\t" + str(tmp_arr[i+1][1]))
                                    
                tmpVal = tmp_arr[i+1]
                tmp_arr[i+1] = tmp_arr[i]
                tmp_arr[i] = tmpVal
                
        label_inversions_consensusGenomicPosition[label_tmp] = tmp_arr
    #ordering array
    tmp = label_inversions_consensusGenomicPosition["y"][1]
    label_inversions_consensusGenomicPosition["y"][1] = label_inversions_consensusGenomicPosition["y"][0]
    label_inversions_consensusGenomicPosition["y"][0] = tmp
    
    
    label_inversion_consensusAngle = {}
    for l in labels:
        if(l in label_inversions_consensusGenomicPosition):
            inversion_gPosision = label_inversions_consensusGenomicPosition[l]
            inversion_angle = []
            for i in inversion_gPosision:
                inversion_angle.append([int(int(i[0])/consensus_step + 0.5), int(int(i[1])/consensus_step + 0.5)])
            label_inversion_consensusAngle[l] = inversion_angle


    def reverseOrientation(angle):
        res = []
        for i in angle:
            if(i >= 180):
                res.append(i - 360)
            else:
                res.append(i)
        return res

    def reverseOrientation2(angle):
        res = []
        for i in angle:
            if(i < 0):
                res.append(i + 360)
            else:
                res.append(i)
        return res
                
    def large_diff(angles, start, stop):
        p1 = start
        p2 = stop
        if(stop >= 180):
            p2 = stop - 360
        if(start >= 180):
            p1 = start - 360
        
        pre = angles[0:180]
        after = angles[180:360]
        after.extend(pre)
        newAngles = reverseOrientation(after)
        
        pi1 = newAngles.index(p1)
        pi2 = newAngles.index(p2)
        startPos = pi1
        endPos = pi2
        if(startPos > endPos):
            startPos = pi2
            endPos = pi1
        tmp = newAngles[startPos: endPos + 1]
        tmp.reverse()
        newAngles[startPos: endPos + 1] = tmp
        originalAngles = reverseOrientation2(newAngles)
        pre2 = originalAngles[0:180]
        after2 = originalAngles[180:360]
        after2.extend(pre2)
        return after2
    
        
    def updateAngles(inversionPosition, stepSize, angles, l, isWork):
        p1 = inversionPosition[0]
        p2 = inversionPosition[1]
        target1 = 0
        target2 = 0
        for i in range(0, 360):
            s1 = int(stepSize * i+0.5)
            s2 = int(stepSize * (i+1)+0.5)
            if (s1 < int(p1) and int(p1) < s2):
                target1 = i
            if (s1 < int(p2) and int(p2) < s2):
                target2 = i
        
            
        pi1 = angles.index(target1)
        pi2 = angles.index(target2) 
        startPos = pi1
        endPos = pi2
        if(pi1 > pi2):
            startPos = pi2
            endPos = pi1
            
        if(target2 - target1 > 180 and (l not in label_skip_large or l == "y" or l == "Q" or l == "l") and isWork):
            angles=large_diff(angles, target1, target2)
            print("ids: "+ l)
        else:
            targetRange = angles[startPos:endPos + 1]
            targetRange.reverse()
            angles[startPos:endPos+1] = targetRange
        return angles

    
    label_modified_ConsensusAngles = {}
    for l in labels.keys():
        angles = list(range(0, 360))
        if(l in label_inversions_consensusGenomicPosition):
            for i in label_inversions_consensusGenomicPosition[l]:
                angles = updateAngles(i, consensus_step, angles, l, True)
            label_modified_ConsensusAngles[l] = angles
        else:
            label_modified_ConsensusAngles[l] = angles

        
        
    label_genePosition_color = {}
    for l in labels.keys():
        outputs = []
        for i in range(0,360):
            p1 = int(consensus_step * i + 0.5)
            p2 = int(consensus_step * (i+1) + 0.5)
            outputs.append([p1, p2, label_modified_ConsensusAngles[l][i]])
        label_genePosition_color[l] = outputs

    
    
    result = {}
    loop = 0
    result["each_genome_info"] = []
    result["consensus_genome_size"] = consensus_genome_size
    for l in newLabelOrder:
        genome_info = {}
        genome_info["genome_name"] = labels[l][1]
        genome_info["acc"] = labels[l][0]
        genome_info["label"] = l
        genome_info["order"] = loop
        loop += 1
        genes = []        
        for i in label_genePosition_color[l]:
            gene = {"start_rotated": i[0], "end_rotated": i[1], "angle": i[2]}
            genes.append(gene)
        genome_info["genes"] = genes
        result["each_genome_info"].append(genome_info)

    for l in noreversals:
        genome_info = {}
        genome_info["genome_name"] = labels[l][1]
        genome_info["acc"] = labels[l][0]
        genome_info["label"] = l
        genome_info["order"] = loop
        loop += 1
        genes = []        
        for i in label_genePosition_color[l]:
            gene = {"start_rotated": i[0], "end_rotated": i[1], "angle": i[2]}
            genes.append(gene)
        genome_info["genes"] = genes
        result["each_genome_info"].append(genome_info)

    with open("result2.json", "w") as f:
        json.dump(result, f, indent=4)


    for id in range(0, 4):
        result = {}
        loop = 0
        result["each_genome_info"] = []
        result["consensus_genome_size"] = consensus_genome_size
        for l2 in ring_group_df[ring_group_df[1].isin([id])][0]:
            l = accessions[l2][0]
            genome_info = {}
            genome_info["genome_name"] = labels[l][1]
            genome_info["acc"] = labels[l][0]
            genome_info["label"] = l
            genome_info["order"] = loop
            loop += 1
            genes = []        
            for i in label_genePosition_color[l]:
                gene = {"start_rotated": i[0], "end_rotated": i[1], "angle": i[2]}
                genes.append(gene)
            genome_info["genes"] = genes
            result["each_genome_info"].append(genome_info)
        
        with open("result_group_" + str(id) + ".json", "w") as f:
            json.dump(result, f, indent=4)
    


















    # get inversion information as genomic posisions
    # label_inversions_genomicPosition = {"A": [[1002031, 1200012],[100, 1010021]]}

    # except for c
    label_inversions_genomicPosition = {}
    for label_tmp in label_inversions_numbers.keys():
        tmp_arr = []
        if (label_tmp == "c"):
            continue;
        print(label_tmp)
        for i in label_inversions_numbers[label_tmp]:
            print(i)
            tmp_i1 = label_Position_geneOrder[label_tmp][int(i[0])]
            tmp_i2 = label_Position_geneOrder[label_tmp][int(i[1])]
            tmp_arr.append([tmp_i1, tmp_i2])
            
        label_inversions_genomicPosition[label_tmp] = tmp_arr
        print("ok")
        
    # for c
    tmp_arr = []
    label_tmp = "c"
    print(label_tmp)
    for i in label_inversions_numbers[label_tmp]:
        print(i)
        if(i[1] == "933"):
            tmp_i1 = label_Position_geneOrder[label_tmp][int(i[0])]
            tmp_i2 = label_Position_geneOrder[label_tmp][932]
            tmp_arr.append([tmp_i1, tmp_i2])
        else:
            tmp_i1 = label_Position_geneOrder[label_tmp][int(i[0])]
            tmp_i2 = label_Position_geneOrder[label_tmp][int(i[1])]
            tmp_arr.append([tmp_i1, tmp_i2])    
    label_inversions_genomicPosition[label_tmp] = tmp_arr
    print("ok")

    len(list(label_inversions_genomicPosition.keys()))
    
        
            
    # calc angle_consensus position    
    consensus_genome_size = 1631000.0
    consensus_step = consensus_genome_size / 359
    angle_consensus_posision = {}
    for i in range(0, 360):
        tmp = [int(consensus_step * i+0.5), int(consensus_step * (i+1)+0.5)]
        angle_consensus_posision[i] = tmp
    
    # calc label_angle_position    
    label_angleId_position = {}
    for l in labels:
        angle_posi = {}
        gSize = label_genomeSize[l]
        stepSize = gSize / 359
        for i in range(0, 360):
            tmp = [int(stepSize * i+0.5), int(stepSize * (i+1)+0.5)]
            angle_posi[i] = tmp
        label_angleId_position[l] = angle_posi
        
    
    #ここ以降は要検討、未完成
    """
    基本的には、genomic positionとの関連をうまくとってあげる必要がある。
    inversionとして登録されているpositionの情報がきたら、そのangleColorを反転させてあげる。iの部分を変更する。
    
    """
    
    label_angleId_angleColor = {}
    for l in labels:
        angleId_angleColor = {}
        for i in range(0, 1080):
            angleId_angleColor[i] = i # change to correct angles
        label_angleId_angleColor[l] = angleId_angleColor


    def updateAngles(inversionPosition, stepSize, angles):
        p1 = inversionPosition[0]
        p2 = inversionPosition[1]
        target1 = 0
        target2 = 0
        for i in range(0, 1080):
            s1 = int(stepSize * i+0.5)
            s2 = int(stepSize * (i+1)+0.5)
            if (s1 < int(p1) and int(p1) < s2):
                target1 = i
            if (s1 < int(p2) and int(p2) < s2):
                target2 = i
        
        pi1 = angles.index(target1)
        pi2 = angles.index(target2) 
        startPos = pi1
        endPos = pi2
        if(pi1 > pi2):
            startPos = pi2
            endPos = pi1
        
        targetRange = angles[startPos:endPos + 1]
        targetRange.reverse()
        angles[startPos:endPos+1] = targetRange
        return angles
    
    label_modified_angles = {}
    for l in label_inversions_genomicPosition.keys():
        gSize = label_genomeSize[l]
        stepSize = gSize / 1079
        angles = list(range(0, 1080))
        for i in label_inversions_genomicPosition[l]:
            angles = updateAngles(i, stepSize, angles)
        label_modified_angles[l] = angles
        
    
    # miss programs
    label_inversion_angle = {}
    noreversals = []
    for l in labels:
        if(l in label_inversions_genomicPosition):
            gSize = label_genomeSize[l]
            stepSize = gSize / 1079
            inversion_gPosision = label_inversions_genomicPosition[l]
            inversion_angle = []
            for i in inversion_gPosision:
                inversion_angle.append([int(int(i[0])/stepSize + 0.5), int(int(i[1])/stepSize + 0.5)])
            label_inversion_angle[l] = inversion_angle
        else:
            noreversals.append(l)
            print(l + " has no inversion")


    # calc rearrangements information
    label_inverted_angles = {}
    for l in label_inversion_angle.keys():
        inversion_angle = label_inversion_angle[l]
        angles = list(range(0,360))
        for p in inversion_angle:
            p1 = angles.index(p[0])
            p2 = angles.index(p[1]) 
            startIndex = 0
            endIndex = 0
            if(p1 < p2):
                startIndex = p1
                endIndex = p2
            else:
                startIndex = p2
                endIndex = p1            
            
            targetRange = angles[startIndex:endIndex+1]
            targetRange.reverse()
            angles[startIndex:endIndex+1] = targetRange
        label_inverted_angles[l] = angles

    
    
    
    
    
    
    
    
    
    
    
    
    
    