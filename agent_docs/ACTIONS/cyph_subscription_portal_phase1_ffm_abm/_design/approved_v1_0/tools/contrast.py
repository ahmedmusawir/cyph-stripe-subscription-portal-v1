import colorsys, json
def hsl(s):
    h,sat,l=s.split(); h=float(h); sat=float(sat.strip('%'))/100; l=float(l.strip('%'))/100
    r,g,b=colorsys.hls_to_rgb(h/360,l,sat); return (r,g,b)
def hexs(c): return '#%02x%02x%02x'%tuple(round(x*255) for x in c)
def lum(c):
    def f(x): return x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4
    r,g,b=c; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def ratio(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
def blend(fg,bg,a): return tuple(fg[i]*a+bg[i]*(1-a) for i in range(3))
T={
'mist':dict(background='217 16% 90%',foreground='220 24% 16%',card='0 0% 100%',primary='12 93% 64%',pfg='0 0% 100%',secondary='216 16% 88%',sfg='220 24% 22%',muted='216 16% 93%',mfg='220 10% 42%',border='216 15% 80%',destructive='2 67% 51%',dfg='0 0% 100%',success='131 54% 40%',sufg='0 0% 100%',warning='41 93% 47%',wfg='0 0% 100%',info='214 74% 53%',ifg='0 0% 100%'),
'slate':dict(background='220 16% 22%',foreground='218 22% 92%',card='220 14% 27%',primary='12 93% 64%',pfg='0 0% 100%',secondary='220 13% 31%',sfg='218 22% 92%',muted='220 13% 31%',mfg='218 14% 70%',border='220 12% 38%',destructive='351 95% 71%',dfg='220 24% 12%',success='142 69% 58%',sufg='220 24% 12%',warning='41 93% 55%',wfg='220 24% 12%',info='214 74% 64%',ifg='220 24% 12%'),
}
for mode,t in T.items():
    c={k:hsl(v) for k,v in t.items()}
    print(f"\n=== {mode.upper()} ===")
    rows=[
     ('foreground on card',c['foreground'],c['card']),
     ('foreground on background',c['foreground'],c['background']),
     ('muted-foreground on card',c['mfg'],c['card']),
     ('muted-foreground on background',c['mfg'],c['background']),
     ('primary-foreground on primary (button)',c['pfg'],c['primary']),
     ('primary text on card (link)',c['primary'],c['card']),
     ('primary text on background',c['primary'],c['background']),
     ('secondary-foreground on secondary',c['sfg'],c['secondary']),
     ('destructive-foreground on destructive',c['dfg'],c['destructive']),
     ('success-foreground on success',c['sufg'],c['success']),
     ('warning-foreground on warning',c['wfg'],c['warning']),
     ('info-foreground on info',c['ifg'],c['info']),
     ('success text on card',c['success'],c['card']),
     ('destructive text on card',c['destructive'],c['card']),
     ('warning text on card',c['warning'],c['card']),
     ('info text on card',c['info'],c['card']),
     ('PILL success text on success/15 over card',c['success'],blend(c['success'],c['card'],0.15)),
     ('PILL warning text on warning/15 over card',c['warning'],blend(c['warning'],c['card'],0.15)),
     ('PILL destructive text on destructive/15 over card',c['destructive'],blend(c['destructive'],c['card'],0.15)),
     ('PILL info text on info/15 over card',c['info'],blend(c['info'],c['card'],0.15)),
     ('PILL muted-fg on muted',c['mfg'],c['muted']),
     ('border vs card (non-text 3:1)',c['border'],c['card']),
     ('card vs background',c['card'],c['background']),
    ]
    for name,fg,bg in rows:
        r=ratio(fg,bg); flag='AA' if r>=4.5 else ('AA-large/UI' if r>=3 else 'FAIL')
        print(f"{r:5.2f}  {flag:12s} {name}   fg={hexs(fg)} bg={hexs(bg)}")
