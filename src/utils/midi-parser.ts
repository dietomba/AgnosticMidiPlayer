/**
 * Utility class per la lettura dei dati MIDI da un DataView
 */
export class MidiParser {
  private pos: number = 0;

  private view: DataView;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  public readUint8(): number {
    return this.view.getUint8(this.pos++);
  }

  public readInt8(): number {
    return this.view.getInt8(this.pos++);
  }

  public readUint16(): number {
    const val = this.view.getUint16(this.pos);
    this.pos += 2;
    return val;
  }

  public readInt16(): number {
    const val = this.view.getInt16(this.pos);
    this.pos += 2;
    return val;
  }

  public readUint32(): number {
    const val = this.view.getUint32(this.pos);
    this.pos += 4;
    return val;
  }

  public readInt32(): number {
    const val = this.view.getInt32(this.pos);
    this.pos += 4;
    return val;
  }

  public readString(length: number): string {
    let str = '';
    for (let i = 0; i < length; i++) {
      str += String.fromCharCode(this.readUint8());
    }
    return str;
  }

  public readVarInt(): number {
    let value = 0;
    let byte;
    do {
      byte = this.readUint8();
      value = (value << 7) | (byte & 0x7f);
    } while (byte & 0x80);
    return value;
  }

  public readSysEx(length: number): number[] {
    const sysexData: number[] = [];
    for (let i = 0; i < length; i++) {
      sysexData.push(this.readUint8());
    }
    return sysexData;
  }

  public skip(length: number): void {
    this.pos += length;
  }

  public get position(): number {
    return this.pos;
  }

  public set position(value: number) {
    this.pos = value;
  }

  public get length(): number {
    return this.view.byteLength;
  }
}
