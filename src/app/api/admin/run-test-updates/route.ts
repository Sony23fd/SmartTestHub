import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import { Question } from "@/models/Question";
import data from "./data.json";

export async function GET() {
  try {
    await connectToDatabase();

    const { q03, q411, qAdult } = data;

    // Test 1: 0-3
    const test03Slug = "autism-test-0-3";
    const t03 = await Test.findOneAndUpdate(
      { slug: test03Slug },
      {
        $set: {
          title: "Аутизм тест (0-3 нас)",
          price: 15000,
          description: "0-3 насны хүүхдийн хөгжилд аутизмын спектрийн эмгэгийн шинж тэмдэг байгаа эсэхийг тодорхойлох суурь сорил.",
          scoringRules: [
            { min: 0, max: 10, status: "GOOD", resultText: "Таны хүүхдэд насандаа тохирсон хөгжиж байгаа бөгөөд аутизмын шинж тэмдэг маш бага ажиглагдаж байна. Цаашид хөгжлийг нь илүү дэмжихийн гар утас, дэлгэцийн хэрэглээг багасгаж, насанд нь тохирсон тархи хөгжүүлэх тоглоом, идэвхитэй харилцаа, өдөр тутмын харилцан яриа тогтмол өрнүүлж байхыг зөвлөж байна." },
            { min: 11, max: 30, status: "AVERAGE", resultText: "Таны хүүхдэд зарим нэг аутизмын шинж тэмдэг ажиглагдаж байгаа бөгөөд энэ нь шууд аутизмтай гэж дүгнэгдэхгүй ч гар утас, дэлгэцийн хамаарлаас үүдэлтэй хэл яриа, биеийн хөгжлийн хоцрогдол явагдаж байж болзошгүй. Нарийн мэргэжлийн эмчид хандахыг зөвлөж байна." },
            { min: 31, max: 60, status: "BAD", resultText: "Таны хүүхдэд аутизмын шинж чанар давамгай илэрч байгаа тул нарийн мэргэжлийн эмчид хандахыг зөвлөж байна. Мөн хүүхдийн хөгжлийн хоцрогдол үүсгэхгүйн тулд гар утас, дэлгэцийн хэрэглээг хязгаарлаж хэл засал, хөдөлмөр засал, зан үйл, мэдрэхүйн интергацийн засалд хамруулахыг зөвлөж байна." }
          ]
        }
      },
      { upsert: true, new: true }
    );
    await Question.deleteMany({ testId: t03._id });
    await Question.insertMany(q03.map((q, i) => ({ ...q, testId: t03._id, order: i + 1 })));

    // Test 2: 4-11
    const test411Slug = "autism-test-4-11";
    const t411 = await Test.findOneAndUpdate(
      { slug: test411Slug },
      {
        $set: {
          title: "Аутизм тест (4-11 нас)",
          price: 15000,
          description: "4-11 насны хүүхдийн хөгжилд аутизмын спектрийн эмгэгийн шинж тэмдэг байгаа эсэхийг тодорхойлох сорил.",
          scoringRules: [
            { min: 0, max: 15, status: "GOOD", resultText: "Таны хүүхдэд аутизмын шинж тэмдэг маш бага ажиглагдаж байна. Хүүхдийн онцлог, дотогшоо зант гэх мэт зүйлстэй холбоотойгоор зарим нэг аутизмын шинж тэмдэгтэй давхцаж болно." },
            { min: 16, max: 45, status: "AVERAGE", resultText: "Таны хүүхдэд зарим нэг аутизмын шинж тэмдэг ажиглагдаж байгаа бөгөөд энэ нь шууд аутизмтай гэж дүгнэгдэхгүй. ADHD, түгшүүр, хэл ярианы онцлог гэх мэт бусад эмгэгүүдтэй давхцахыг үгүйсгэхгүй." },
            { min: 46, max: 90, status: "BAD", resultText: "Таны хүүхдэд аутизмын шинж чанар давамгай илэрч байгаа тул нарийн мэргэжлийн эмчид хандахыг зөвлөж байна." }
          ]
        }
      },
      { upsert: true, new: true }
    );
    await Question.deleteMany({ testId: t411._id });
    await Question.insertMany(q411.map((q, i) => ({ ...q, testId: t411._id, order: i + 1 })));

    // Test 3: Adult
    const testAdultSlug = "autism-test-adult";
    const tAdult = await Test.findOneAndUpdate(
      { slug: testAdultSlug },
      {
        $set: {
          title: "Аутизм тест (Насанд хүрэгсэд)",
          price: 15000,
          description: "Насанд хүрэгчдэд зориулсан аутизмын хүрээний эмгэгийг илрүүлэх сорил.",
          scoringRules: [
            { min: 0, max: 10, status: "GOOD", resultText: "Танд аутизмын шинж тэмдэг маш бага ажиглагдаж байгаа бөгөөд хувь хүний зан, онцлог нь зарим нэг аутизмын хүрээний эмгэгийн шинж чанартай давхцаж болно." },
            { min: 11, max: 25, status: "AVERAGE", resultText: "Танд хөнгөн хэлбэрийн аутизмын шинж тэмдэг ажиглагдаж байгаа ч хувь хүний зан байдал нь аутизмын хүрээний эмгэгтэй давхцаж байж болно. Нарийн мэргэжлийн эмч, сэтгэл зүйчид хандахыг зөвлөж байна." },
            { min: 26, max: 48, status: "BAD", resultText: "Танд аутизмын шинж тэмдэг давамгай илэрч байна. Хэрэв сэтгэл зүй, ажил, амьдралд гэр бүл, харилцаанд хүндрэл учирч байвал нарийн мэргэжлийн эмч, сэтгэл зүйчид хандахыг зөвлөж байна." }
          ]
        }
      },
      { upsert: true, new: true }
    );
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
