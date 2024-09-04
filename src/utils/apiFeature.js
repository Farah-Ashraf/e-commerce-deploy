export class ApiFeature {
  constructor(mongooseQuery, queryData) {
    this.mongooseQuery = mongooseQuery;
    this.queryData = queryData;
  }

  pagination() {
    let { page, size } = this.queryData;
    page = parseInt(page); //1.5 => 1
    size = parseInt(size);
    //some conditions if the frontEnd didn't send the page and the size
    if (page <= 0) page = 1;
    if (size <= 0) size = 2;
    //calculate the skip
    const skip = (page - 1) * size;
    this.mongooseQuery.limit(size).skip(skip);
    return this;
  }

  sort() {
    if (this.queryData.sort) {
      this.mongooseQuery.sort(this.queryData.sort.replaceAll(",", " "));
    }
    return this;
  }

  select() {
    if (this.queryData.select) {
      this.mongooseQuery.select(this.queryData.select.replaceAll(",", " "));
    }
    console.log(this.queryData.select)
    return this;
  }

  filter() {
    let { page, size, sort, ...filter } = this.queryData;
    filter = JSON.parse(
      JSON.stringify(filter).replace(/gt|gte|lt|lte/g, (match) => `$${match}`)
    );
    this.mongooseQuery.find(filter);
    return this;
  }
}
