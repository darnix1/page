#!/bin/bash
print(){
case $1 in
 -b)echo -e "\e[38;5;226m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";;
 -a)echo -ne "\e[38;5;226m$2";;
 -r)echo -ne "\e[1;31m$2";;
esac
}

unset text value

value='wAlslskwo3ADMc'
value+='gh@drowkid01sta'
text='ESPERE UN MOMENTO '
value+='rt@botlatmxupdateadm-litechukkalav3egapaaaalslskm'

until [[ ! -z ${args[@]} ]]; do
  args=($(echo $*|awk -F "-" '{print $1,$2,$3,$4,$5,$6,$7,$8,$9}'))
   for((i=0;i<=${#args[@]};i++));do
     case ${args[@]:0} in
	'ADMcgh'|'start'|'drowkid'|'update')break;;
        *)exit "$((( $? * $OPTIND ) / $RANDOM ))";;
     esac
   done
done

powered=( [0]='@drowkid01 ' [1]='✧ | ᴅʀᴏᴡᴋɪᴅ | ✧ ' )
text+="--${args[0]##$value}"

echo -e "		\e[1;97m$text\e[0m"
sleep 2
clear
print -b
echo -e "$(print -r 'INICIANDO INSTALACIÓN')"
