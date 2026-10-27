import colorsys
def hsl(h,s,l): return colorsys.hls_to_rgb(h/360,l/100,s/100)
def hexs(c): return '#%02x%02x%02x'%tuple(round(x*255) for x in c)
def lum(c):
    f=lambda x: x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4
    r,g,b=c; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def ratio(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
def blend(fg,bg,a): return tuple(fg[i]*a+bg[i]*(1-a) for i in range(3))
white=(1,1,1); dark=hsl(220,24,12)
mist_card=white; mist_fg=hsl(220,24,16); slate_card=hsl(220,14,27); slate_fg=hsl(218,22,92)
print("Goal: status TEXT on card >= 4.5 (small text); border on 10% tint >= 3.0 (non-text); fg on 10% tint >= 4.5")
print("\nMIST — max lightness meeting text>=4.5:")
for name,h,s,base in [('success',131,54,40),('warning',38,100,47),('info',214,74,53),('destructive',2,67,51)]:
    for L10 in range(600,100,-5):
        L=L10/10; c=hsl(h,s,L)
        if ratio(c,mist_card)>=4.5:
            tint=blend(c,mist_card,0.10)
            print(f"  {name:12s} L={L:4.1f}% (base {base}%)  text {ratio(c,mist_card):.2f}  border/tint {ratio(c,tint):.2f}  fg/tint {ratio(mist_fg,tint):.2f}  white/solid {ratio(white,c):.2f}  {hexs(c)}"); break
print("\nSLATE — min lightness meeting text>=4.5 on card:")
for name,h,s,base in [('success',142,69,58),('warning',41,93,55),('info',214,74,64),('destructive',351,95,71)]:
    for L10 in range(400,950,5):
        L=L10/10; c=hsl(h,s,L)
        if ratio(c,slate_card)>=4.5:
            tint=blend(c,slate_card,0.10)
            print(f"  {name:12s} L={L:4.1f}% (base {base}%)  text {ratio(c,slate_card):.2f}  border/tint {ratio(c,tint):.2f}  fg/tint {ratio(slate_fg,tint):.2f}  dark/solid {ratio(dark,c):.2f}  {hexs(c)}"); break
coral=hsl(12,93,64)
print("\nPRIMARY: dark(220 24% 12%) on coral", round(ratio(dark,coral),2), "| mist-fg on coral", round(ratio(mist_fg,coral),2))
print("coral border on card: mist", round(ratio(coral,mist_card),2), "slate", round(ratio(coral,slate_card),2), " (underline / selected-border cue, non-text)")
print("foreground on card: mist", round(ratio(mist_fg,mist_card),2), "slate", round(ratio(slate_fg,slate_card),2))
mist_mfg=hsl(220,10,42); slate_mfg=hsl(218,14,70)
print("muted-fg on card: mist", round(ratio(mist_mfg,mist_card),2), "slate", round(ratio(slate_mfg,slate_card),2))
print("muted-fg on background: mist", round(ratio(mist_mfg,hsl(217,16,90)),2), "slate", round(ratio(slate_mfg,hsl(220,16,22)),2))
