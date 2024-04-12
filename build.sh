#!/bin/sh
#set -x

OUTFLDR=dist
if [ -d ${OUTFLDR} ]
then
	rm -f ${OUTFLDR}/*
else
	mkdir ${OUTFLDR}
fi

MODE="$1"
if [ -z "${MODE}" ]
then
	MODE="build"
fi
GCCOPT="--charset UTF-8 --warning_level VERBOSE"
if [ "${MODE}" = "check" ]
then
	GCCOPT="${GCCOPT} --compilation_level ADVANCED"
else
	GCCOPT="${GCCOPT} --compilation_level BUNDLE"
fi
GCCEXT="--externs extern/forge.js --externs extern/win.js --externs extern/te.js"
OUTF="--js_output_file ${OUTFLDR}/script.js"
if [ "${MODE}" = "check" ]
then
	OUTF="--checks_only"
elif [ "${MODE}" = "dev" ]
then
	OUTF="--js_output_file ${OUTFLDR}/script-dev.js"
fi
jss=""
while read fil
do
	if [ -n "${fil}" ]
	then
		c=$(echo "${fil}" | cut -b1)
		if [ "$c" = "!" ]
		then
			if [ "${MODE}" = "check" -o "${MODE}" = "dev" ]
			then
				jss="${jss} --js src/$(echo "${fil}" | cut -b2-)"
			fi
		elif [ "$c" != "#" ]
		then
			jss="${jss} --js src/${fil}"
		fi
	fi
done <<EOF
base.js
progress.js
binutil.js
crypto.js
!test.js
EOF
msg="$(npx google-closure-compiler ${GCCOPT} ${GCCEXT} ${jss} ${OUTF} 2>&1)"
RET=$?
if [ -n "${msg}" ]
then
	echo "${msg}"
	exit 10
elif [ ${RET} -eq 0 ]
then
	if [ "${MODE}" = "check" ]
	then
		echo "Check OK."
	else
		echo "Compiled js files."
	fi
else
	echo "google-closure-compiler failed."
	exit 11
fi

if [ "${MODE}" != "check" ]
then
	while read fil
	do
		if [ -n "${fil}" ]
		then
			c=$(echo "${fil}" | cut -b1)
			if [ "$c" != "#" ]
			then
				outf="${OUTFLDR}/${fil}"
				if [ "${MODE}" = "dev" ]
				then
					sed -e "s/..\/..\/script\/index.css/..\/test\/index-dev.css/g" "src/${fil}" > "${outf}"
					if [ $? -eq 0 ]
					then
						echo "Created html file: ${outf}"
					else
						echo "Failed create html file: ${outf}"
						exit 20
					fi
				else
					cp -pf "src/${fil}" "${outf}"
					if [ $? -eq 0 ]
					then
						echo "Copied html file: ${outf}"
					else
						echo "Failed copy html file: ${outf}"
						exit 21
					fi
				fi
			fi
		fi
	done <<EOF2
progressbar.html
EOF2

	echo "Build result:"
	ls -l ${OUTFLDR}/
fi

exit 0
