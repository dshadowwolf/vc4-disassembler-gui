# Encoding/Lengths
```
1111 1xxx xxxx xxxx y:32 z:32    vector80   
1111 0xxx xxxx xxxx y:32         vector48
1110 xxxx xxxx xxxx y:32         scalar48
1xxx xxxx xxxx xxxx y:16         scalar32
0xxx xxxx xxxx xxxx              scalar16
```
Operand Byte Ordering:
```
vector80  1 0,  3 2,  5 4,  7 6,  9 8
vector48  1 0,  3 2,  5 4
scalar32  1 0,  3 2,
scalar16  1 0
```
## Condition Codes
```
Bits    Comment     Meaning        Name
----------------------------------------
0000    Simple      Equal          eq
0001    Simple      Not Equal      ne
0010    Unsigned    C set, <       cs/lo    Note inverted sense of carry from ARM.
0011    Unsigned    C clear, >=    cc/hs    Note inverted sense of carry from ARM.
0100    Simple      N set          mi
0101    Simple      N clear        pl
0110    Simple      V set          vs
0111    Simple      V clear        vc
1000    Unsigned    >              hi 
1001    Unsigned    <=             ls
1010    Signed      >=             ge
1011    Signed      <              lt
1100    Signed      >              gt
1101    Signed      <=             le 
1110    Simple      Always 
1111    Simple      Never          f
```
## Fixed-length/value scalar 16 instructions
```
0000 0000 0000 0000    bkpt                Halt/Breakpoint
0000 0000 0000 0001    nop                 No operation
0000 0000 0000 0010    sleep               (provisional)
0000 0000 0000 0011    user                (provisional) Enter user mode.
0000 0000 0000 0100    ei                  Enable interrupts
0000 0000 0000 0101    di                  Disable interrupts
0000 0000 0000 0110    cbclr               Clear vector column base ie SR[5:4] = 0
0000 0000 0000 0111    cbadd1              Add 1 to vector column base ie SR[5:4]+=1
0000 0000 0000 1000    cbadd2              Add 2 to vector column base ie SR[5:4]+=2
0000 0000 0000 1001    cbadd3              Add 3 to vector column base ie SR[5:4]+=3

0000 0000 0000 1010    rti                 Return from interrupt, ie. sr = *sp++; pc = *sp++;
0000 0000 001d dddd    swi rd              Software Interrupt.  Raise interrupt 0x20+(rd&0x1f)
0000 0000 010d dddd    b rd                Branch to address in rd, ie. pc = rd.
0000 0000 011d dddd    bl rd               Save pc to lr and branch to target, ie. pc = rd.

0000 0000 1000 dddd    switch.b rd         Table branch byte.  pc = pc + 2*(*(s8 *)(pc+rd))
0000 0000 1010 dddd    switch rd           Table branch short. pc = pc + 2*(*(s16 *)(pc+rd))    
0000 0000 111d dddd    version rd          Get cpu version and core number.
0000 0001 11uu uuuu    swi u               Software Interrupt.  Raise interrupt 0x20+u&0x1f
```

## Other Operations
### Arithmetic and Logical Operations Encoding
```
4-bit  oooo  -> 0oooo0, ie. only 16 operations are available (mov, add, mul, and so forth)
5-bit ooooo  -> 0ooooo, ie. only the first 32 operations are available
6-bit oooooo -> oooooo, ie. all operations are available
```
#### Operations
```
000000    mov      rd, ra              rd = ra                               Move.
000001    cmn      rd, ra              ZNCV = cc(rd + ra)                    Compare values by addition.
000010    add      rd, ra              rd = rd + ra                          Add
000011    bic      rd, ra              rd = rd & ~ra                         Logical bit clear.
000100    mul      rd, ra              rd = rd * ra                          Multiply.
000101    eor      rd, ra              rd = rd ^ ra                          Logical Exclusive Or.
000110    sub      rd, ra              rd = rd - ra                          Subtract.
000111    and      rd, ra              rd = rd & ra                          Logical And.
001000    not      rd, ra              rd = ~ra                              Not / 1s Complement.
001001    ror      rd, ra              rd = rotate_right(rd, ra)             Rotate right.
001010    cmp      rd, ra              ZNCV = cc(rd - ra)                    Compare values.
001011    rsub     rd, ra              rd = ra - rd                          Reverse subtract.
001100    btest    rd, ra              Z = (rd & bit(ra)) == 0               Bit test.
001101    or       rd, ra              rd = rd or ra                         Logical or.
001110    bmask    rd, ra              rd = rd & mask(ra)                    Mask left most bits.
001111    max      rd, ra              rd = max(ra, rd)                      Maximum.
010000    bitset   rd, ra              rd = rd | bit(ra)                     Bit set.
010001    min      rd, ra              rd = min(ra, rd)                      Minimum.
010010    bitclear rd, ra              rd = rd & ~bit(ra)                    Bit clear.
010011    addscale rd, ra << 1         rd = rd + (ra << 1)                   Add scaled by 2.
010100    bitflip  rd, ra              rd = rd ^ bit(ra)                     Bit flip.
010101    addscale rd, ra << 2         rd = rd + (ra << 2)                   Add scaled by 4.
010110    addscale rd, ra << 3         rd = rd + (ra << 3)                   Add scaled by 8.
010111    addscale rd, ra << 4         rd = rd + (ra << 4)                   Add scaled by 16.
011000    signext  rd, ra              rd = sign_extend(rd & mask(ra))       Mask left most bits and sign extend.
011001    neg      rd, ra              rd = -ra                              Negate.
011010    lsr      rd, ra              rd = rd >> ra                         Logical shift right.
011011    msb      rd, ra              rd = msb(ra)                          Position of most significant 1 bit, (msb(0)==-1)
011100    shl      rd, ra              rd = rd << ra                         Logical shift left.
011101    brev     rd, ra              rd = reverse(rd) >> (32-ra)           Reverse bits and shift right.
011110    asr      rd, ra              rd = rd >> ra                         Arithmetic shift right.
011111    abs      rd, ra              rd = abs(ra)                          Absolute value.
100000    mulhd.ss rd, ra, rb          rd = (ra * rb) >> 32                  High half of 32x32 -> 64 bit product; ra, rb are both signed
100001    mulhd.su rd, ra, rb          rd = (ra * rb) >> 32                  High half of 32x32 -> 64 bit product; ra is signed, rb is unsigned
100010    mulhd.us rd, ra, rb          rd = (ra * rb) >> 32                  High half of 32x32 -> 64 bit product; rb is signed, ra is unsigned
100011    mulhd.uu rd, ra, rb          rd = (ra * rb) >> 32                  High half of 32x32 -> 64 bit product; ra, rb are both unsigned
100100    div.ss   rd, ra, rb          rd = (ra / rb)                        Divide; ra, rb are both signed
100101    div.su   rd, ra, rb          rd = (ra / rb)                        Divide; ra is signed, rb is unsigned
100110    div.us   rd, ra, rb          rd = (ra / rb)                        Divide; rb is signed, ra is unsigned
100111    div.uu   rd, ra, rb          rd = (ra / rb)                        Divide; ra, rb are both unsigned
101000    adds     rd, ra, rb          rd = saturate32(ra + rb)
101001    subs     rd, ra, rb          rd = saturate32(ra - rb)
101010    shls     rd, ra, rb          rd = saturate32(ra << rb)
101011    clipsh   rd, rb              rd = saturate16(rb)
101100    addscale rd, ra, rb << 5     rd = ra + (rb << 5)
101101    addscale rd, ra, rb << 6     rd = ra + (rb << 6)
101110    addscale rd, ra, rb << 7     rd = ra + (rb << 7)
101111    addscale rd, ra, rb << 8     rd = ra + (rb << 8)
110000    count    rd, rb              rd = count(rb)
110001    subscale rd, ra, rb << 1     rd = ra - (rb << 1)
110010    subscale rd, ra, rb << 2     rd = ra - (rb << 2)
110011    subscale rd, ra, rb << 3     rd = ra - (rb << 3)
110100    subscale rd, ra, rb << 4     rd = ra - (rb << 4)
110101    subscale rd, ra, rb << 5     rd = ra - (rb << 5)
110110    subscale rd, ra, rb << 6     rd = ra - (rb << 6)
110111    subscale rd, ra, rb << 7     rd = ra - (rb << 7)
111000    subscale rd, ra, rb << 8     rd = ra - (rb << 8)
```
Where:
```
  Unary operations ignore ra, ie '<op> rd, ra, rb' behaves as 'rd = <op> rb'
  Operations 57 (111001) to 63 (111111) are undefined and raise a 0x03 exception.
  All bit shifts counts are modulo 32 (ie. masked with &31).
  bit(x) =  1 << x
  mask(x) = bit(x)-1
  saturate16(x) = min(0x7fff, max(-0x8000, x))
  saturate32(x) = min(0x7fffffff, max(-0x80000000, x))
  count(x) = number of 1 bits in x.
```
#### Load/Store Operation Width
```
  ww is 00 for ld/st for u32 operations.
  ww as 01 for ldh/sth for u16 operations.
  ww as 10 for ldb/stb for u8 operations.
  ww as 11 for ldsh/ldsb for s16/s8 load operation.
```
### Memory Operations
```
0000 0010 0bbm mmmm    ldm rb-rm,(sp++)    Load registers from stack (highest first).
0000 0010 1bbm mmmm    stm rb-rm,(--sp)    Store registers to stack (lowest first).
0000 0011 0bbm mmmm    ldm rb-rm,pc,(sp++) Load registers from stack and final value into pc.
0000 0011 1bbm mmmm    stm rb-rm,lr,(--sp) Store lr followed by registers onto stack.

                                           where: 
                                           - rb is r0, r6, r16, or r24 for bb == 00, 01, 10, 11.
                                           - rm = (rb+m)&31

                                           If sp is stored, then the value after the store is stored.
                                           If mmmmm is 31 and pc/lr are stored/loaded, then no register
                                           but pc/lr is stored/loaded ("stm lr/ldm pc"). The same
                                           applies at least to "stm r24-r7, lr, (--sp)".

0000 010o oooo dddd    ld   rd, (sp+o*4)   Load from memory relative to stack pointer.
0000 011o oooo dddd    st   rd, (sp+o*4)   Store to memory relative to stack pointer.

0000 1ww0 ssss dddd    ld<w>   rd, (rs)    Load from memory.
0000 1ww1 ssss dddd    st<w>   rd, (rs)    Store to memory.

0001 0ooo oood dddd    add  rd, sp, o*4    rd = sp + o*4

0001 1ccc cooo oooo    b<cc>  $+o*2        Branch on condition to target.

0010 uuuu ssss dddd    ld  rd, (rs+u*4)    rd = *(rs + u*4)
0011 uuuu ssss dddd    st  rd, (rs+u*4)    *(rs + u*4) = rd
```
### Arithmetal and Logical Operation
```
010 op:5 s:4 d:4     Rd = Rd op Ra         Register with Register logical and arithmetic operations.
011 op:4 u:5 d:4     Rd = Rd op u          Register with Immediate logical and arithmetic operations
```
#### Scalar 32
```
1000 cccc aaaa dddd 00ss ssoo oooo oooo    addcmpb<cc> rd, ra, rs, $+o*2   rd += ra; if (rd <cc> rs) branch
1000 cccc iiii dddd 01ss ssoo oooo oooo    addcmpb<cc> rd, i, rs, $+o*2    rd += i;  if (rd <cc> rs) branch
1000 cccc aaaa dddd 10uu uuuu oooo oooo    addcmpb<cc> rd, ra, u, $+o*2    rd += ra; if (rd <cc> u) branch
1000 cccc iiii dddd 11uu uuuu oooo oooo    addcmpb<cc> rd, i, u, $+o*2     rd += i;  if (rd <cc> u) branch

1001 cccc 0ooo oooo oooo oooo oooo oooo    b<cc> $+o*2                     if (<cc>) branch to target.
1001 oooo 1ooo oooo oooo oooo oooo oooo    bl $+o*2                        Save pc to lr and branch to target.

# Conditional with indexed
1010 0000 ww0 d:5 a:5 c:4 00 b:5           ld<w>.<cc> rd, (ra + rb << w)   if (<cc>) rd = *(ra+rb*width)
1010 0000 ww1 d:5 a:5 c:4 00 b:5           st<w>.<cc> rd, (ra + rb << w)   if (<cc>) *(ra+rb*width) = d

# 12 bit displacement
1010 001o ww0 d:5 a:5 o:11                 ld<w> rd, (ra+o)                rd = *(ra+o)
1010 001o ww1 d:5 a:5 o:11                 st<w> rd, (ra+o)                *(ra+o) = rd

# Conditional with pre decrement
1010 0100 ww0 d:5 a:5 c:4 00 0 0000        ld<w>.<cc> rd, (--ra)           if (<cc>) rd = *--ra
1010 0100 ww1 d:5 a:5 c:4 00 0 0000        st<w>.<cc> rd, (--ra)           if (<cc>) *--ra = rd

# Conditional with post increment
1010 0101 ww0 d:5 a:5 c:4 00 0 0000        ld<w>.<cc> rd, (ra++)           if (<cc>) rd = *ra++
1010 0101 ww1 d:5 a:5 c:4 00 0 0000        st<w>.<cc> rd, (ra++)           if (<cc>) *ra++ = rd

# 16 bit displacement
1010 1000 ww 0 d:5 o:16                    ld<w> rd, (r24+o)              rd = *(r24+o)
1010 1000 ww 1 d:5 o:16                    st<w> rd, (r24+o)              *(r24+o) = rd
1010 1001 ww 0 d:5 o:16                    ld<w> rd, (sp+o)               rd = *(sp+o)
1010 1001 ww 1 d:5 o:16                    st<w> rd, (sp+o)               *(sp+o) = rd
1010 1010 ww 0 d:5 o:16                    ld<w> rd, (pc+o)               rd = *(pc+o)
1010 1010 ww 1 d:5 o:16                    st<w> rd, (pc+o)               *(pc+o) = rd
1010 1011 ww 0 d:5 o:16                    ld<w> rd, (r0+o)               rd = *(r0+o)
1010 1011 ww 1 d:5 o:16                    st<w> rd, (r0+o)               *(r0+o) = rd

1011 00 op:5 d:5 i:16                      <op> rd, i                     rd = rd op i
1011 01 s:5 d:5 i:16                       add rd, rs, i                  rd = rs + i
1011 1111 111 d:5 o:16                     add rd, pc, o                  rd = pc + o

1100 0 op:6 d:5 a:5 c:4 00 b:5             <op>.<cc> rd, ra, rb           if (<cc>) rd = rd op ra
1100 0 op:6 d:5 a:5 c:4 1 i:6              <op>.<cc> rd, ra, i            if (<cc>) rd = ra op i
```
##### Floating Point Cruft
```
1100 100 fop:4 d:5 a:5 c:4 00 b:5          <fop>.<cc> rd, ra, rb          if (<cc>) rd = ra fop rb
1100 100 fop:4 d:5 a:5 c:4 1 i:6           <fop>.<cc> rd, ra, i           if (<cc>) rd = ra fop float6(i)

Where:
  fop is an operation according to the 4 bit floating point operation table:
    fadd, fsub, fmul, fdiv, fcmp, fabs, frsub, fmax, 
    frcp, frsqrt, fnmul, fmin, fceil, ffloor, flog2, fexp2

  cc is a condition code test (see condition code table);
    eq,ne ,cs/lo, cc/hs, mi, pl, vs, vc, hi, ls, ge, lt, gt, le 

  float6(x) converts a 6 bit binary number to float (1 sign bit, 3 bit exponent, 2 bit mantissa)
```
```c
      float float6(imm) {
        uint32_t b = 0;
        if (imm & 0x20) {
            b |= 0x80000000;
        }
        int exponent = (imm >> 2) & 0x7;
        if (exponent != 0) {
            b |= (exponent + 124) << 23;
            int mantissa = imm & 0x3;
            b |= mantissa << 21;
        }
        return *(float *)&b;
      }
```
###### Floating Point Integer Conversion
```
1100 101 0 000 d:5 a:5 c:4 00 b:5          ftrunc.<cc> rd, ra, sasl rb    if (<cc>) rd = (int)(ra*pow(2,rb))
1100 101 0 000 d:5 a:5 c:4 1 i:6           ftrunc.<cc> rd, ra, sasl i     if (<cc>) rd = (int)(ra*pow(2,i))
1100 101 0 001 d:5 a:5 c:4 00 b:5          floor.<cc> rd, ra, sasl rb     if (<cc>) rd = (int)floor(ra*pow(2,rb))
1100 101 0 001 d:5 a:5 c:4 1 i:6           floor.<cc> rd, ra, sasl i      if (<cc>) rd = (int)floor(ra*pow(2,i))
1100 101 0 010 d:5 a:5 c:4 00 b:5          flts.<cc> rd, ra, sasr rb      if (<cc>) rd = ((float)(int)ra)/pow(2,rb)
1100 101 0 010 d:5 a:5 c:4 1 i:6           flts.<cc> rd, ra, sasr i       if (<cc>) rd = ((float)(int)ra)/pow(2,i)
1100 101 0 011 d:5 a:5 c:4 00 b:5          fltu.<cc> rd, ra, sasr rb      if (<cc>) rd = ((float)(uint)ra)/pow(2,rb)
1100 101 0 011 d:5 a:5 c:4 1 i:6           fltu.<cc> rd, ra, sasr i       if (<cc>) rd = ((float)(uint)ra)/pow(2,i)

Where:
  sasl is an arithmetic shift left by a signed amount (ie negative shifts, shift to the right).
  sasr is an arithmetic shift right by a signed amount (ie negative shifts, shift to the left).
```
#### Processor Control Register Access
```
1100 1100 000 d:5 0000 0000 000 a:5        mov pd, ra                     pd = ra
1100 1100 001 d:5 0000 0000 000 a:5        mov rd, pd                     rd = pa
```

### Scalar 48
#### basic/memory/flow-control
```
1110 0000 0000 0000 u:32                   j u                                Jump to target.
1110 0001 0000 0000 o:32                   b $+o                              Branch to target.
1110 0010 0000 0000 u:32                   jl u                               Save pc to lr and jump to target.
1110 0011 0000 0000 o:32                   bl $+o                             Save pc to lr and branch to target.

1110 0101 000 d:5 o:32                     add rd, pc, o                      rd = pc + o

1110 0110 ww 0 d:5 s:5 o:27                ld<w>  rd, (rs+o)                  Load from address rs+o to rd+o
1110 0110 ww 1 d:5 s:5 o:27                st<w>  rd, (rs+o)                  Store from rd to address rs+o

1110 0111 ww 0 d:5 11111 o:27              ld<w>  rd, (pc+o)                  Load pc relative.
1110 0111 ww 1 d:5 11111 o:27              st<w>  rd, (pc+o)                  Store pc relative.
```
#### Arithmetic/Logical
```
1110 10 p:5 d:5 u:32                       <op> rd, u                         rd = rd op u
1110 11 s:5 d:5 u:32                       add rd, rs, u                      rd = rs + u
```
### Vector Instructions
***TBD***
