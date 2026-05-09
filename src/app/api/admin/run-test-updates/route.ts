import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import { Question } from "@/models/Question";
import fs from "fs";
import path from "path";

function parseQuestions(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const questions = [];
  
  for(let line of lines) {
    // Strip the answer keys at the end
    let qText = line
      .replace(/Т0.*Ү3/i, '')
      .replace(/Т3.*Ү0/i, '')
      .replace(/Т0\s*Ү1/i, '')
      .replace(/Т1\s*Ү0/i, '')
      .replace(/Тийм 0.*Үгүй 3/i, '')
      .replace(/Тийм 3.*Үгүй 0/i, '')
      .replace(/Тийм 0.*Үгүй 1/i, '')
      .replace(/Тийм 1.*Үгүй 0/i, '')
      .replace(/Т0, И1, З2, Ү3/i, '')
      .replace(/Т3, И2, З1, Ү0/i, '')
      .replace(/Т1Ү0/i, '')
      .replace(/Т0Ү1/i, '')
      .replace(/Тийм 0, Ихэвчлэн 1, Заримдаа 2,\s*Үгүй 3 оноо/i, '')
      .replace(/Тийм 0 оноо, Ихэвчлэн 1, Заримдаа 2,\s*Үгүй 3 оноо/i, '')
      .replace(/Тийм 3, Ихэвчлэн 2, Заримдаа 1, Үгүй 0/i, '')
      .replace(/Тийм 0 , Ихэвчлэн 1, Заримдаа 2, Үгүй 3/i, '')
      .trim();
      
    // Remove any trailing commas or stray characters
    qText = qText.replace(/[,]$/, '').trim();

    if(line.match(/Т0.*Ү3/i) || line.includes('Үгүй 3')) {
      questions.push({ text: qText, options: [{text:'Тийм',score:0},{text:'Ихэвчлэн',score:1},{text:'Заримдаа',score:2},{text:'Үгүй',score:3}] });
    } else if(line.match(/Т3.*Ү0/i) || line.includes('Үгүй 0')) {
      questions.push({ text: qText, options: [{text:'Тийм',score:3},{text:'Ихэвчлэн',score:2},{text:'Заримдаа',score:1},{text:'Үгүй',score:0}] });
    } else if(line.match(/Т0.*Ү1/i) || line.includes('Т0 Ү1') || line.includes('Т0Ү1')) {
      questions.push({ text: qText, options: [{text:'Тийм',score:0},{text:'Үгүй',score:1}] });
    } else if(line.match(/Т1.*Ү0/i) || line.includes('Т1 Ү0') || line.includes('Т1Ү0')) {
      questions.push({ text: qText, options: [{text:'Тийм',score:1},{text:'Үгүй',score:0}] });
    }
  }
  return questions;
}

export async function GET() {
  try {
    await connectToDatabase();

    // Paths
    const p03 = path.join(process.cwd(), '03_clean.txt');
    const p411 = path.join(process.cwd(), '411_clean.txt');
    const pAdult = path.join(process.cwd(), 'adult_clean.txt');

    const q03 = parseQuestions(fs.readFileSync(p03, 'utf8'));
    const q411 = parseQuestions(fs.readFileSync(p411, 'utf8'));
    const qAdult = parseQuestions(fs.readFileSync(pAdult, 'utf8'));

    // Test 1: 0-3
    const test03Slug = "autism-test-0-3";
    await Test.findOneAndDelete({ slug: test03Slug });
    const t03 = await Test.create({
      title: "Аутизм тест (0-3 нас)",
      slug: test03Slug,
      price: 15000,
      description: "0-3 насны хүүхдийн хөгжилд аутизмын спектрийн эмгэгийн шинж тэмдэг байгаа эсэхийг тодорхойлох суурь сорил.",
      scoringRules: [
        { min: 0, max: 10, status: "GOOD", resultText: "Таны хүүхдэд насандаа тохирсон хөгжиж байгаа бөгөөд аутизмын шинж тэмдэг маш бага ажиглагдаж байна. Цаашид хөгжлийг нь илүү дэмжихийн гар утас, дэлгэцийн хэрэглээг багасгаж, насанд нь тохирсон тархи хөгжүүлэх тоглоом, идэвхитэй харилцаа, өдөр тутмын харилцан яриа тогтмол өрнүүлж байхыг зөвлөж байна." },
        { min: 11, max: 30, status: "AVERAGE", resultText: "Таны хүүхдэд зарим нэг аутизмын шинж тэмдэг ажиглагдаж байгаа бөгөөд энэ нь шууд аутизмтай гэж дүгнэгдэхгүй ч гар утас, дэлгэцийн хамаарлаас үүдэлтэй хэл яриа, биеийн хөгжлийн хоцрогдол явагдаж байж болзошгүй. Нарийн мэргэжлийн эмчид хандахыг зөвлөж байна." },
        { min: 31, max: 60, status: "BAD", resultText: "Таны хүүхдэд аутизмын шинж чанар давамгай илэрч байгаа тул нарийн мэргэжлийн эмчид хандахыг зөвлөж байна. Мөн хүүхдийн хөгжлийн хоцрогдол үүсгэхгүйн тулд гар утас, дэлгэцийн хэрэглээг хязгаарлаж хэл засал, хөдөлмөр засал, зан үйл, мэдрэхүйн интергацийн засалд хамруулахыг зөвлөж байна." }
      ]
    });
    await Question.deleteMany({ testId: t03._id });
    await Question.insertMany(q03.map((q, i) => ({ ...q, testId: t03._id, order: i + 1 })));

    // Test 2: 4-11
    const test411Slug = "autism-test-4-11";
    await Test.findOneAndDelete({ slug: test411Slug });
    const t411 = await Test.create({
      title: "Аутизм тест (4-11 нас)",
      slug: test411Slug,
      price: 15000,
      description: "4-11 насны хүүхдийн хөгжилд аутизмын спектрийн эмгэгийн шинж тэмдэг байгаа эсэхийг тодорхойлох сорил.",
      scoringRules: [
        { min: 0, max: 15, status: "GOOD", resultText: "Таны хүүхдэд аутизмын шинж тэмдэг маш бага ажиглагдаж байна. Хүүхдийн онцлог, дотогшоо зант гэх мэт зүйлстэй холбоотойгоор зарим нэг аутизмын шинж тэмдэгтэй давхцаж болно." },
        { min: 16, max: 45, status: "AVERAGE", resultText: "Таны хүүхдэд зарим нэг аутизмын шинж тэмдэг ажиглагдаж байгаа бөгөөд энэ нь шууд аутизмтай гэж дүгнэгдэхгүй. ADHD, түгшүүр, хэл ярианы онцлог гэх мэт бусад эмгэгүүдтэй давхцахыг үгүйсгэхгүй." },
        { min: 46, max: 90, status: "BAD", resultText: "Таны хүүхдэд аутизмын шинж чанар давамгай илэрч байгаа тул нарийн мэргэжлийн эмчид хандахыг зөвлөж байна." }
      ]
    });
    await Question.deleteMany({ testId: t411._id });
    await Question.insertMany(q411.map((q, i) => ({ ...q, testId: t411._id, order: i + 1 })));

    // Test 3: Adult
    const testAdultSlug = "autism-test-adult";
    await Test.findOneAndDelete({ slug: testAdultSlug });
    const tAdult = await Test.create({
      title: "Аутизм тест (Насанд хүрэгсэд)",
      slug: testAdultSlug,
      price: 15000,
      description: "Насанд хүрэгчдэд зориулсан аутизмын хүрээний эмгэгийг илрүүлэх сорил.",
      scoringRules: [
        { min: 0, max: 10, status: "GOOD", resultText: "Танд аутизмын шинж тэмдэг маш бага ажиглагдаж байгаа бөгөөд хувь хүний зан, онцлог нь зарим нэг аутизмын хүрээний эмгэгийн шинж чанартай давхцаж болно." },
        { min: 11, max: 25, status: "AVERAGE", resultText: "Танд хөнгөн хэлбэрийн аутизмын шинж тэмдэг ажиглагдаж байгаа ч хувь хүний зан байдал нь аутизмын хүрээний эмгэгтэй давхцаж байж болно. Нарийн мэргэжлийн эмч, сэтгэл зүйчид хандахыг зөвлөж байна." },
        { min: 26, max: 48, status: "BAD", resultText: "Танд аутизмын шинж тэмдэг давамгай илэрч байна. Хэрэв сэтгэл зүй, ажил, амьдралд гэр бүл, харилцаанд хүндрэл учирч байвал нарийн мэргэжлийн эмч, сэтгэл зүйчид хандахыг зөвлөж байна." }
      ]
    });
    await Question.deleteMany({ testId: tAdult._id });
    await Question.insertMany(qAdult.map((q, i) => ({ ...q, testId: tAdult._id, order: i + 1 })));

    return NextResponse.json({ 
      success: true, 
      message: "Бүх 3 тест шинэчлэгдлээ!", 
      stats: {
        t03: q03.length,
        t411: q411.length,
        tAdult: qAdult.length
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
