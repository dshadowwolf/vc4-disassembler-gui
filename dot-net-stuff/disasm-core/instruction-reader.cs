using System;
using System.IO;

namespace VC4Tools {
   class INSNReader {
       INSNReader(FileStream inputSource) {

       }

        INSNReader(String inputSource) => INSNReader(FileStream(inputSource));
    }
}