using System.Collections;

namespace VC4Tools {
    private static string[] sizes = new string ["SCALAR16", "SCALAR32", "SCALAR48", "VECTOR48", "VECTOR80" ];
    private static INSNSize getInstructionSize(byte[2] bits) {
        int v = bits[0];
        if( v & VECTOR80 ) return VECTOR80;
        else if( v & VECTOR48 ) return VECTOR48;
        else if( v & SCALAR48 ) return SCALAR48;
        else if( v & SCALAR32 ) return SCALAR32;
        else return SCALAR16;        
    }

    public static int getInstructionSizeIndex(byte[2] bits) {
        int rr = -1;
        switch(getInstructionSize(bits)) {
            case VECTOR80:
                rr++;
            case VECTOR48:
                rr++;
            case SCALAR48:
                rr++;
            case SCALAR32:
                rr++;
            case SCALAR16:
                rr++;
                break;
        }
        return rr;
    }

    public static string getInstructionSize(byte[2] bits) {
        int idx = getInstructionSizeIndex(bits);
        if( idx < 0 ) return "!!ERROR!!";
        
        return new string(sizes[rr]);
    }

    enum INSNSize {
        SCALAR16 = 0, SCALAR32 = 1 << 15, SCALAR48 = 7 << 13, VECTOR48 = 15 << 12, VECTOR80 = 31 << 11
    };

    enum OpCode_LogicArith {
        MOV = 0, CMN, ADD, BIC, MUL, EOR, SUB, AND, NOT, ROR, CMP, RSUB, BTEST, OR, BMASK, MAX, BITSET, MIN, BITCLEAR,
        ADDSCALE_RR_1, BITFLIP, ADDSCALE_RR_2, ADDSCALE_RR_3, ADDSCALE_RR_4, SIGNEXT, NEG, LSR, MSB, SHL, BREV, ASR,
        ABS, MULHD_SS, MULHD_SU, MULHD_US, MULHD_UU, DIV_SS, DIV_SU, DIV_US, DIV_UU, ADDS, SUBS, SHLS, CLIPSH,
        ADDSCALE_RRR_5, ADDSCALE_RRR_6, ADDSCALE_RRR_7, ADDSCALE_RRR_8, COUNT, SUBSCALE_1, SUBSCALE_2, SUBSCALE_3,
        SUBSCALE_4, SUBSCALE_5, SUBSCALE_6, SUBSCALE_7, SUBSCALE_8
    };

    enum ConditionCode {
        EQ = 0, NE, CS_LO, CS_HS, MI, PL, VS, VC, HI, LS, GE, LT, GT, LE, T, F = 15
    };

    enum OpCode_Scalar16_Flat {
        BKPT, NOP, SLEEP, USER, EI, DI, CBCLR, CBADD1, CBADD2, CBADD3, RTI = 10
    };

    enum OpCode_Scalar16_Param {
        SWI_R = 1 << 5, B_R = 2 << 5, BL_R = 3 << 5, SWITCH_B = 8 << 4, SWITCH = 10 << 4, VERSION = 14 << 4, SWI_U = 14 << 5
    };

    enum OpCode_Scalar16_MemOps {
        LDM_RB_RM_SP = 4 << 7, STM_RB_RM_SP = 5 << 7, LDM_RB_RM_PC_SP = 6 << 7, STM_RB_RM_PC_SP = 7 << 7,
        LD_RD_SP = 1 << 10, ST_RD_SP = 3 << 9, LD_W_RD_RS = -1, ST_W_RD_RS = -2, ADD_RD_SP_O = 2 << 11,
        BCC_O = 3 << 11, LD_RD_RS_U = 2 << 12, ST_RD_RS_U = 3 << 12
    };


    interface IInstruction {
        int getSize();
        void setParameters(List<byte> parameterBytes);
        bool needsParameters();
        bool hasParameters();
    }

    class Instruction : IInstruction {
        private INSNSize size;

        // SCALAR16 instruction
        Instruction(byte[2] sourceBytes) {
            size = 2; // SCALAR16
        }

        // SCALAR32 instruction
        Instruction(byte[4] sourceBytes) {
            size = 4; // SCALAR32
        }

        // SCALAR48 or VECTOR48 instruction
        Instruction(byte[6] sourceBytes) {
            size = 6; // 48 bits
        }

        // VECTO80 instruction
        Instruction(byte[10] sourceBytes) {
            size = 10; // 80 bits
        }

        int getSize() {
            return INSNSize;
        }

        // does the instruction need parameters not included in the instruction data itself ?
        bool needsParameters() {
            return false;
        }

        bool hasParameters() {
            return false;
        }

        // give the bytes for the parameters
        void setParameters(List<byte> parameterBytes) {

        }
    }
}