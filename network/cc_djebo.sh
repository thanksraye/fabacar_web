#!/bin/bash
instruction=$1
version=$2
cc_name=djebo

set -ev

#chaincode install
docker exec cli peer chaincode install -n $cc_name -v $version -p github.com/go
#chaincode instatiate
docker exec cli peer chaincode $instruction -n $cc_name -v $version -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 5


# docker exec cli peer chaincode invoke -n $cc_name -C mychannel -c '{"Args":["uregister","user1"]}'
# sleep 5

# docker exec cli peer chaincode invoke -n $cc_name -C mychannel -c '{"Args":["cregister","company1"]}'
# sleep 5

# docker exec cli peer chaincode invoke -n $cc_name -C mychannel -c '{"Args":["ureport","user1","company1", "r1", "illegal parking hashcode:xxxxxx"]}'
# sleep 5

# docker exec cli peer chaincode query -n $cc_name -C mychannel -c '{"Args":["recordread","r1"]}'


echo '-------------------------------------END-------------------------------------'
