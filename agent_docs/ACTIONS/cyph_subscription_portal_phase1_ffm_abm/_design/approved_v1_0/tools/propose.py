import colorsys
def hsl(h,s,l):
    return colorsys.hls_to_rgb(h/360,l/100,s/100)
def hexs(c): return '#%02x%02x%02x'%tuple(round(x*255) for x in c)
def lum(c):
    def f(x): return x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4
    r,g,b=c; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def ratio(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
def blend(fg,bg,a): return tuple(fg[i]*a+bg[i]*(1-a) for i in range(3))
white=(1,1,1); dark=hsl(220,24,12); mistcard=white; slatecard=hsl(220,14,27)
print("MIST — find max L so that pill(text on 15% tint over white) >= 4.5 and white-on-solid >= 4.5 if possible")
for name,h,s in [('success',131,54),('warning',41,93),('info',214,74),('destructive',2,67)]:
    best=None
    for L10 in range(600,100,-5):
        L=L10/10; c=hsl(h,s,L)
        pill=ratio(c,blend(c,mistcard,0.15)); txt=ratio(c,mistcard); solid=ratio(white,c)
        if pill>=4.5:
            best=(L,pill,txt,solid,hexs(c)); break
    print(f"  {name:12s} L={best[0]:5.1f}%  pill={best[1]:.2f} text={best[2]:.2f} white-on-solid={best[3]:.2f} {best[4]}")
# warning with more saturation / hue shift option
for L10 in range(500,200,-5):
    L=L10/10; c=hsl(36,100,L); pill=ratio(c,blend(c,white,0.15))
    if pill>=4.5: print(f"  warning alt hue36 s100 L={L}% pill={pill:.2f} white-on-solid={ratio(white,c):.2f} {hexs(c)}"); break
print("\nSLATE — find min L so pill(text on 15% tint over card) >= 4.5 and dark-fg-on-solid >= 4.5")
for name,h,s in [('success',142,69),('warning',41,93),('info',214,74),('destructive',351,95)]:
    best=None
    for L10 in range(400,950,5):
        L=L10/10; c=hsl(h,s,L)
        pill=ratio(c,blend(c,slatecard,0.15)); txt=ratio(c,slatecard); solid=ratio(dark,c)
        if pill>=4.5 and solid>=4.5:
            best=(L,pill,txt,solid,hexs(c)); break
    print(f"  {name:12s} L={best[0]:5.1f}%  pill={best[1]:.2f} text={best[2]:.2f} dark-on-solid={best[3]:.2f} {best[4]}")
print("\nPRIMARY coral 12 93% 64%:")
coral=hsl(12,93,64)
print("  white on coral", round(ratio(white,coral),2), " dark(220 24% 12%) on coral", round(ratio(dark,coral),2), " foreground mist(220 24% 16%) on coral", round(ratio(hsl(220,24,16),coral),2))
for L in [58,56,54,52,50,48]:
    c=hsl(12,93,L); print(f"  coral L={L}% white-on {ratio(white,c):.2f} {hexs(c)}")
