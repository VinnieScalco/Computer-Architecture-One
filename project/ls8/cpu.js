/**
 * LS-8 v2.0 emulator skeleton code
 */

const fs = require('fs');

// Instructions

const HLT = 0b00000001; // Halt CPU
const ADD = 0b10101000;
const LDI = 0b10011001; 
const MUL = 0b10101010;
const PRN = 0b01000011;
// PRN

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {

    /**
     * Initialize the CPU
     */
    constructor(ram) {
        this.ram = ram;

        this.reg = new Array(8).fill(0); // General-purpose registers
        
        // Special-purpose registers
        this.reg.PC = 0; // Program Counter
        this.reg.IR = 0; // Instruction Register

		this.setupBranchTable();
    }
	
	/**
	 * Sets up the branch table
	 */
	setupBranchTable() {
		let bt = {};

        bt[HLT] = this.HLT;
        bt[ADD] = this.ADD;
        bt[LDI] = this.LDI;
        bt[MUL] = this.MUL;
        bt[PRN] = this.PRN;

		this.branchTable = bt;
	}

    /**
     * Store value in memory address, useful for program loading
     */
    poke(address, value) {
        this.ram.write(address, value);
    }

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        const _this = this;

        this.clock = setInterval(() => {
            _this.tick();
        }, 1);
    }

    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.clock);
    }

    /**
     * ALU functionality
     * 
     * op can be: ADD SUB MUL DIV INC DEC CMP
     */
    alu(op, regA, regB) {
        switch (op) {
            case 'MUL':
                this.reg[regA] = this.reg[regA] * this.reg[regB];
                break;
            case 'ADD':
                this.reg[regA] = this.reg[regA] + this.reg[regB]
               break;
        }
    }

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Load the instruction register (IR) from the current PC
        this.reg.IR = this.ram.read(this.reg.PC);

        // Debugging output
        console.log(`${this.reg.PC}: ${this.reg.IR.toString(2)}`);
        
        // Based on the value in the Instruction Register, locate the
        // appropriate hander in the branchTable
        let handler = this.branchTable[this.reg.IR];

        // Check that the handler is defined, halt if not (invalid
        // instruction)
        // !!! IMPLEMENT ME
        if (handler === undefined) {
            console.log('Unknown opcode ' + this.reg.IR);
            this.stopClock();
            return;
        }


        let operandA = this.ram.read(this.reg.PC + 1);
        let operandB = this.ram.read(this.reg.PC + 2);
        // We need to use call() so we can set the "this" value inside
        // the handler (otherwise it will be undefined in the handler)
        handler.call(this, operandA, operandB);

        // Increment the PC register to go to the next instruction
        this.reg.PC += ((this.reg.IR >> 6) & 0b00000011) +1;

    }

    // INSTRUCTION HANDLER CODE:
    ADD(regA, regB) {
        this.alu('ADD', regA, regB);
    }
    HLT() {
        this.stopClock();
    }
    LDI(registerNumber, value) {
        this.reg[registerNumber] = value & 255; //anding with 255 limits the size to no more than 255
    }
    MUL(regA, regB) {
        this.alu('MUL', regA, regB);
    }
    PRN(regA) {
        console.log(this.reg[regA]);
    }
}

module.exports = CPU;