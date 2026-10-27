declare module 'pdf-parse' {
  type Options={max?:number};
  type Result={text:string};
  export default function parse(buffer:Buffer,options?:Options):Promise<Result>;
}

declare module 'mammoth' {
  const mammoth:{extractRawText(input:{buffer:Buffer}):Promise<{value:string}>};
  export default mammoth;
}
