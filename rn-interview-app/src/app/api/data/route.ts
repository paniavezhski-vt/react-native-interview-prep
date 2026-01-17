import { NextResponse } from 'next/server';
import { parseMarkdownFile, mapEnglishTitles } from '@/lib/parser';
import path from 'path';

const RU_FILE = path.resolve(process.cwd(), 'public/react-native-interview-prep-2026-ru.md');
const EN_FILE = path.resolve(process.cwd(), 'public/react-native-interview-prep-2026.md');

export async function GET() {
  try {
    const [ruData, enData] = await Promise.all([
      parseMarkdownFile(RU_FILE, false),
      parseMarkdownFile(EN_FILE, true),
    ]);

    // Map English titles to Russian data
    mapEnglishTitles(ruData, enData);

    return NextResponse.json({
      ru: ruData,
      en: enData,
    });
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}
