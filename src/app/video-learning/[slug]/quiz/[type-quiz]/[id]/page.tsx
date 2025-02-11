"use client";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";

export default function Page() {
  return (
    <div className="">
      <div>
        <Image
          width={200}
          height={200}
          src="https://miro.medium.com/v2/resize:fit:828/format:webp/1*1UBNwRFaslvqt_G3Njw3pg.jpeg"
          alt=""
        ></Image>
      </div>
      <div className="mt-5">
        <h1>Apa fungsi utama dari Node.js?</h1>
      </div>
      <div className="mt-5">
        <div className="flex flex-col">
          <RadioGroup defaultValue="comfortable">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="r1" />
              <Label htmlFor="r1">
                Menyediakan antarmuka pengguna grafis (GUI)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="r2" />
              <Label htmlFor="r2">
                Mengembangkan aplikasi server-side berbasis JavaScript
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="r3" />
              <Label htmlFor="r3">Mengelola basis data relasional</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="r4" />
              <Label htmlFor="r4">Membuat dokumen HTML</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
