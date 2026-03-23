import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import { Question } from "@/models/Question";
import { Submission } from "@/models/Submission";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Clear old data
    await Test.deleteMany({});
    await Question.deleteMany({});
    await Submission.deleteMany({});

    // 2. Parse and seed 1.txt (Adults)
    const adultTxt = fs.readFileSync(path.join(process.cwd(), "public/1.txt"), "utf8");
    const adultTest = await Test.create({
      title: "Аутизмын тест насанд хүрэгсэд",
      slug: "autism-test-adults",
      price: 15000,
      description: "Насанд хүрэгчдийн аутизмын шинж тэмдэг илрүүлэх сорил.",
      icon: "User",
      scoringRules: [
        { min: 0, max: 5, status: "GOOD", resultText: "Танд аутизмын шинж тэмдэг байхгүй." },
        { min: 6, max: 25, status: "AVERAGE", resultText: "Танд хөнгөн хэлбэрийн аутизмын шинж тэмдэг илэрч байгаа бөгөөд хэрэв энэ нь таны амьдралын хэв маягт хүндрэл учруулдаг бол нарийн мэргэжлийн эмчид хандахыг зөвлөж байна." },
        { min: 26, max: 100, status: "BAD", resultText: "Танд аутизмын шинж тэмдэг давамгай илэрч байгаа тул нарийн мэргэжлийн эмчид хандахыг зөвлөж байна." }
      ]
    });

    const adultLines = adultTxt.split("\n").map(l => l.trim()).filter(l => l && l.match(/^\d+\./));
    let order = 1;
    for (const line of adultLines) {
      // e.g. "1. Бусдыг ойлгох, ... Т1 Ү0"
      const match = line.match(/^\d+\.\s*(.+?)\s*[ТT](\d+)\s*,?\s*[ҮY](\d+)$/i);
      if (match) {
        let text = match[1].trim();
        let yesScore = parseInt(match[2]);
        let noScore = parseInt(match[3]);
        
        await Question.create({
          testId: adultTest._id,
          order: order++,
          text,
          options: [
            { text: "Тийм", score: yesScore },
            { text: "Үгүй", score: noScore }
          ]
        });
      } else {
        console.log("Failed to parse adult line: ", line);
      }
    }

    // 3. Parse and seed 2.txt (4-11 years)
    const kidsTxt = fs.readFileSync(path.join(process.cwd(), "public/2.txt"), "utf8");
    const kidsTest = await Test.create({
      title: "Аутизм тест 4-11 нас",
      slug: "autism-test-4-11",
      price: 15000,
      description: "4-11 насны хүүхдийн хөгжилд аутизмын спектрийн эмгэгийн шинж тэмдэг байгаа эсэхийг тодорхойлох суурь сорил.",
      icon: "Baby",
      scoringRules: [
        { min: 0, max: 10, status: "GOOD", resultText: "Хүүхдийн хөгжил одоогоор хэвийн түвшинд байна. Аутизмын спектрийн эмгэгийн шинж тэмдэг бага байна. Гэсэн хэдий ч хүүхдийнхээ нийгэмшихүйн хөгжлийг үргэлжлүүлэн дэмжиж, ажиглаж байхыг зөвлөж байна." },
        { min: 11, max: 20, status: "AVERAGE", resultText: "Дунд зэргийн эрсдэлтэй байна. Хүүхдийн зан төлөв болон харилцааны явцад зарим нэг анхаарал татсан шинж чанарууд ажиглагдаж байна. Мэргэжлийн хүүхдийн сэтгэл зүйч эсвэл мэдрэлийн эмчид хандаж, дэлгэрэнгүй зөвлөгөө авахыг зөвлөж байна." },
        { min: 21, max: 100, status: "BAD", resultText: "Өндөр эрсдэлтэй байна. Сорилын дүн хүүхдэд аутизмын спектрийн эмгэгийн шинж тэмдэг илэрхий байгааг харуулж байна. Хүүхдийн хөгжлийн хоцрогдол болон ирээдүйн чадварт нөлөөлөхөөс сэргийлж, яаралтай мэргэжлийн оношилгоо, эрт үеийн оролцооны хөтөлбөрт хамрагдах шаардлагатай." }
      ]
    });

    const kidsLines = kidsTxt.split("\n").map(l => l.trim()).filter(l => l && l.match(/^\d+\./));
    order = 1;
    for (const line of kidsLines) {
      const match = line.match(/^\d+\.\s*(.+?)\s*[ТT](\d+)\s*,?\s*[ҮY](\d+)$/i);
      if (match) {
        let text = match[1].trim();
        let yesScore = parseInt(match[2]);
        let noScore = parseInt(match[3]);
        
        await Question.create({
          testId: kidsTest._id,
           order: order++,
          text,
          options: [
            { text: "Тийм", score: yesScore },
            { text: "Үгүй", score: noScore }
          ]
        });
      } else {
        console.log("Failed to parse kids line: ", line);
      }
    }


    // 4. Parse and seed 3.txt (0-3 years)
    const babyTxt = fs.readFileSync(path.join(process.cwd(), "public/3.txt"), "utf8");
    const babyTest = await Test.create({
      title: "0-3 насны хүүхдийн аутизм тест",
      slug: "autism-test-0-3",
      price: 15000,
      description: "0-3 насны хүүхдийн аутизмын шинж тэмдэг илрүүлэх сорил.",
      icon: "Stethoscope",
      scoringRules: [
        { min: 0, max: 3, status: "GOOD", resultText: "Таны хүүхэд аутизмын шинж тэмдэг маш багатай бөгөөд хэвийн бойжиж байна." },
        { min: 4, max: 7, status: "AVERAGE", resultText: "Таны хүүхдэд хөнгөн зэргийн аутизмын шинж тэмдэг илэрч байгаа бөгөөд нарийн мэргэжлийн эмчид хандахыг зөвлөж байна." },
        { min: 8, max: 100, status: "BAD", resultText: "Таны хүүхдэд аутизмын шинж чанар давамгай илэрч байгаа тул нарийн мэргэжлийн эмчид хандахыг зөвлөж байна." }
      ]
    });

    const babyLines = babyTxt.split("\n").map(l => l.trim()).filter(l => l && l.match(/^\d+\./));
    order = 1;
    for (const line of babyLines) {
      // Baby test has messier parsing. E.g. "Тийм 0 оноо Үгүй 1 оноо", "Т0, Ү1", "Т1 Ү2"
      let text = line.replace(/^\d+\.\s*/, "").trim();
      let yesScore = 0;
      let noScore = 1;

      if (text.includes("Тийм 0 оноо Үгүй 1 оноо")) { yesScore = 0; noScore = 1; text = text.replace("Тийм 0 оноо Үгүй 1 оноо", "").trim(); }
      else if (text.includes("Тийм 0 оноо, Үгүй 2 оноо")) { yesScore = 0; noScore = 2; text = text.replace("Тийм 0 оноо, Үгүй 2 оноо", "").trim(); }
      else if (text.includes("Тийм 1, Ү0")) { yesScore = 1; noScore = 0; text = text.replace("Тийм 1, Ү0", "").trim(); }
      else if (text.includes("Т0, Ү1")) { yesScore = 0; noScore = 1; text = text.replace("Т0, Ү1", "").trim(); }
      else if (text.includes("Т1 Ү0")) { yesScore = 1; noScore = 0; text = text.replace("Т1 Ү0", "").trim(); }
      else if (text.includes("Т0 Ү1")) { yesScore = 0; noScore = 1; text = text.replace("Т0 Ү1", "").trim(); }
      else if (text.includes("Т1 Ү2")) { yesScore = 1; noScore = 2; text = text.replace("Т1 Ү2", "").trim(); }

      // clean up trailing ? markers
      text = text.replace(/\s*\?\s*$/, "?").trim();

      await Question.create({
        testId: babyTest._id,
        order: order++,
        text,
        options: [
          { text: "Тийм", score: yesScore },
          { text: "Үгүй", score: noScore }
        ]
      });
    }

    return NextResponse.json({ success: true, message: "Cleaned DB and seeded exactly from public text files." });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
