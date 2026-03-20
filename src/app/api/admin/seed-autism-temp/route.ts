import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import { Question } from "@/models/Question";

export async function GET() {
  try {
    await connectToDatabase();

    const testTitle = "Аутизм тест (4-11 нас)";
    const testSlug = "autism-test-4-11";

    // Check if already exists
    const existing = await Test.findOne({ slug: testSlug });
    if (existing) {
      return NextResponse.json({ success: false, message: "Энэ тест аль хэдийн байна." });
    }

    // 1. Create the Test
    const test = await Test.create({
      title: testTitle,
      slug: testSlug,
      price: 15000,
      description: "4-11 насны хүүхдийн хөгжилд аутизмын спектрийн эмгэгийн шинж тэмдэг байгаа эсэхийг тодорхойлох суурь сорил.",
      scoringRules: [
        {
          min: 0,
          max: 10,
          status: "GOOD",
          resultText: "Хүүхдийн хөгжил одоогоор хэвийн түвшинд байна. Аутизмын спектрийн эмгэгийн шинж тэмдэг бага байна. Гэсэн хэдий ч хүүхдийнхээ нийгэмшихүйн хөгжлийг үргэлжлүүлэн дэмжиж, ажиглаж байхыг зөвлөж байна."
        },
        {
          min: 11,
          max: 20,
          status: "AVERAGE",
          resultText: "Дунд зэргийн эрсдэлтэй байна. Хүүхдийн зан төлөв болон харилцааны явцад зарим нэг анхаарал татсан шинж чанарууд ажиглагдаж байна. Мэргэжлийн хүүхдийн сэтгэл зүйч эсвэл мэдрэлийн эмчид хандаж, дэлгэрэнгүй зөвлөгөө авахыг зөвлөж байна."
        },
        {
          min: 21,
          max: 31,
          status: "BAD",
          resultText: "Өндөр эрсдэлтэй байна. Сорилын дүн хүүхдэд аутизмын спектрийн эмгэгийн шинж тэмдэг илэрхий байгааг харуулж байна. Хүүхдийн хөгжлийн хоцрогдол болон ирээдүйн чадварт нөлөөлөхөөс сэргийлж, яаралтай мэргэжлийн оношилгоо, эрт үеийн оролцооны хөтөлбөрт хамрагдах шаардлагатай."
        }
      ]
    });

    const testId = test._id;

    const questionsData = [
      { text: "Таны хүүхэд нэрээр дуудахад эргэж харж байна уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд бусад хүүхдүүдтэй тоглож байна уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд тантай ярих гэж хүрч ирж байна уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд 2 настайдаа ярьсан уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд спортын ямар нэгэн тоглоомонд дуртай байна уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд хамт олонтой байх дуртай юу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд жижиг сажиг зүйлсийг нарийн анзаарч байна уу?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд 3 настайдаа хийсвэр сэтгэж тоглож байсан уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд нэг үйлдлээ давтаж хийж байна уу?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд харилцан ярьдаг уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд үгээр өөрийгөө илэрхийлж чадахгүйдээ стресстэж байна уу?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд найзтай юу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Танд сонирхож байгаа зүйлсээ илэрхийлдэг үү?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд хошигнол ойлгож байна уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд дүрэм, журам тайлбарлахад тайван ойлгодог уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд бусад хүүхдүүдийн хийж байгаа аливаа үйлдлийг дуурайдаг үү?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд гэнэт шалтгаангүйгээр инээх эсвэл уйлдаг уу?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд өөрөө бие даан хувцсаа өмсөж байна уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд сөрөг үгс хэлж байна уу?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд гар, хуруугаа савчих хөдөлгөөн хийдэг үү?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд тоглоомоо жагсааж, өрж тоголж байна уу?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд нүд рүү эгцэлж хардаг уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд өөрийгөө “би” гэж хэлэхийн оронд нэрээ хэлдэг үү?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд зарим зүйлийг сайтар тайлбарлахаас нааш ойлгохгүй байна уу?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд дугуй унаж чадаж байна уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхэд зарчимч уу? Эсвэл дүрэм, журмыг эрхэмлэх дуртай юу?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Хийдэг зүйлсийг нь өөрөөр хийхэд дургүйцдаг уу?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд таныг халамжлах үйлдэл хийдэг үү?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
      { text: "Таны хүүхдийн хөгжлийн талаар эмч, эрүүл мэндийн ажилчид ямар нэгэн зүйлс анхааруулж хэлж байсан уу?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд шинэлэг хоол турших дургүй зөвхөн тодорхой хэдэн зүйлсээ иддэг?", options: [{ text: "Тийм", score: 1 }, { text: "Үгүй", score: 0 }] },
      { text: "Таны хүүхэд сэтгэл хөдлөлөө илэрхийлж байна уу?", options: [{ text: "Тийм", score: 0 }, { text: "Үгүй", score: 1 }] },
    ];

    const questions = questionsData.map((q, i) => ({
      ...q,
      testId,
      order: i + 1
    }));

    await Question.insertMany(questions);
    return NextResponse.json({ success: true, message: "Амжилттай нэмэгдлээ!" });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
