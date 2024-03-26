TEXWEB=texk/tex.web
ETEXCH=etexdir/etex.ch
CHANGE_FILES=$(ETEXCH) $(addprefix jstex/,date.ch ord-chr.ch logopenout.ch license.ch tokens.ch inputln.ch nonlocal-goto.ch codes.ch filesize.ch strcmp.ch shellescape.ch directjs.ch uchar.ch kanjiskip.ch expanded.ch snapshot.ch banner.ch version.ch wordsize.ch)

all:

parser.js: parser.jison
	npx jison -o parser.js -m js parser.jison

changes.ch: $(TEXWEB) $(CHANGE_FILES)
	tie -c $@ $(TEXWEB) $(CHANGE_FILES)

tripchanges.ch: $(TEXWEB) changes.ch trip.ch
	tie -c $@ $(TEXWEB) changes.ch trip.ch

################################################################

bigmem-changes.ch: $(TEXWEB) changes.ch bigmem.ch
	tie -c $@ $(TEXWEB) changes.ch bigmem.ch

tex.web: $(TEXWEB)
	cp $< $@

tex.p tex.pool: tex.web bigmem-changes.ch
	tangle -underline tex.web bigmem-changes.ch
tex.pool: tex.p

tex.wasm: tex.p parser.js
	node compile.js $< $@

tex-async.wasm: tex.wasm
	# --mod-asyncify-never-unwind
	wasm-opt --code-folding --coalesce-locals-learning --precompute-propagate --code-pushing --simplify-locals --flatten --rereloop --dfo --rereloop --rereloop --ssa-nomerge --local-cse --asyncify --pass-arg=asyncify-ignore-indirect --licm --flatten --rereloop --merge-locals --merge-blocks --remove-unused-brs --remove-unused-names --dae-optimizing --inlining-optimizing --generate-stack-ir --optimize-stack-ir --optimize-instructions --vacuum -O4 -O4 $< -o $@
	echo wasm-opt --asyncify --pass-arg=asyncify-ignore-indirect --mod-asyncify-never-unwind -O3 $< -o $@

core.dump: tex-async.wasm library.js
	node initex.js

################################################################

trip.web: $(TEXWEB)
	cp $< $@

trip.p trip.pool: trip.web tripchanges.ch
	tangle -underline trip.web tripchanges.ch
trip.pool: trip.p

trip.wasm: trip.p parser.js
	node compile.js $< $@

trip-async.wasm: trip.wasm
	wasm-opt --asyncify --pass-arg=asyncify-ignore-indirect -O4 $< -o $@

trip.tfm: triptrap/trip.pl
	pltotf $< $@

trip.tex: triptrap/trip.tex
	cp $< $@

tripin.log trip.fmt: trip.tfm trip.tex trip.js trip-async.wasm trip.pool
	echo -ne "\n\\input trip\n" | node trip.js
	mv trip.log tripin.log
trip.fmt: tripin.log

trip.log trip.dvi tripos.tex 8terminal.tex: trip.tfm trip.tex trip.js trip-async.wasm trip.pool trip.fmt
	echo 'how many spaces before & ?'
	echo -ne " &trip  trip " | node trip.js
trip.dvi: trip.log
tripos.tex: trip.log
8terminal.tex: trip.log

trip.typ: trip.dvi
	dvitype -output-level=2 -dpi=72.27 -page-start=*.*.*.*.*.*.*.*.*.* $< > $@

triptest: tripdiff.js tripin.log trip.log triptrap/tripin.log triptrap/trip.log
	node tripdiff.js tripin.log triptrap/tripin.log
	node tripdiff.js trip.log triptrap/trip.log

etrip.tfm: etexdir/etrip/etrip.pl
	pltotf $< $@

etrip.tex: etexdir/etrip/etrip.tex
	cp $< $@

etripin.log etrip.fmt: etrip.tfm etrip.tex trip.js trip-async.wasm trip.pool
	echo "Missing initial input?"
	echo -ne "\n*etrip\n" | node trip.js
	mv etrip.log etripin.log
etrip.fmt: etripin.log

etrip.log etrip.dvi etrip.out etrip.fot: etrip.tfm etrip.tex trip.js trip-async.wasm trip.pool
	echo -ne "\n&etrip etrip\n" | node trip.js > etrip.fot
etrip.dvi: etrip.log
etrip.out: etrip.log
etrip.fot: etrip.log

etrip.typ: etrip.dvi
	dvitype -output-level=2 -dpi=72.27 -page-start=*.*.*.*.*.*.*.*.*.* $< > $@

etriptest: tripdiff.js etripin.log etexdir/etrip/etripin.log etrip.log etexdir/etrip/etrip.log etrip.out etexdir/etrip/etrip.out etrip.typ etexdir/etrip/etrip.typ etrip.fot etexdir/etrip/etrip.fot
	diff etrip.out etexdir/etrip/etrip.out
	node tripdiff.js etripin.log etexdir/etrip/etripin.log
	node tripdiff.js etrip.log etexdir/etrip/etrip.log
	node tripdiff.js etrip.typ etexdir/etrip/etrip.typ
	node tripdiff.js etrip.fot etexdir/etrip/etrip.fot

test: triptest etriptest

clean:
	rm -f changes.ch
	rm -f trip.tfm trip.tex
	rm -f trip.wasm
	rm -f trip-async.wasm
	rm -f trip.web
	rm -f tripchanges.ch
	rm -f trip.fmt
	rm -f tripin.log
	rm -f trip.p
	rm -f trip.pool
	rm -f trip.tex
	rm -f trip.tfm
	rm -f trip.typ
	rm -f trip.log trip.dvi tripos.tex 8terminal.tex
	rm -f trip.typ
	rm -f etrip.tfm etrip.tex
	rm -f etrip.log etrip.dvi etrip.out etripin.log etrip.fmt
	rm -f etrip.typ
