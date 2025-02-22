"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useEffect } from "react";

export default function Page() {
  const pagination = Array.from({ length: 10 }, (v, i) => i + 1);
  useEffect(() => {
    console.log(pagination);
  }, []);
  return (
    <div className="grid grid-cols-4">
      <div className="flex col-span-3 gap-4">
        <div>
          <Image width={200} height={200} src="" alt=""></Image>
        </div>
        <div>
          <div className="mt-5 text-3xl">
            <h1>
              Untuk melakukan analisa Hazard, terdiri dari tiga bagian, salah
              satunya adalah:
            </h1>
          </div>
          <div className="mt-5">
            <div className="flex flex-col">
              <RadioGroup defaultValue="comfortable">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="r1" />
                  <Label className="text-2xl" htmlFor="r1">
                    Menetapkan signifikansi dari hazards
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border">
                  <RadioGroupItem value="2" id="r2" />
                  <Label className="text-2xl" htmlFor="r2">
                    Mengidentifikasi detail produk
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="r3" />
                  <Label className="text-2xl" htmlFor="r3">
                    Melakukan evaluasi terhadap warna kemasan
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="r4" />
                  <Label className="text-2xl" htmlFor="r4">
                    Melakukan cek terhadap proses pengemasan
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
      {/* pagination */}
      <div className="justify-self-end">
        <div className="grid grid-cols-4 gap-2 bg-white p-4 rounded-xl max-w-fit">
          {pagination.map((item: number) => (
            <>
              <Button className="m-0">{item}</Button>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
