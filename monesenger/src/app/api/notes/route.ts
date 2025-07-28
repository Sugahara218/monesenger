
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export async function GET() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error(error);
    return NextResponse.json([{ message: 'error' }]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const newData = await req.json();
    await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2));
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'error' }, { status: 500 });
  }
}
