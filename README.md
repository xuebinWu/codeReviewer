
# codeReviewer
codeReviewer 是一个用来做代码评审的扩展，可标注问题代码，同步至代码仓库。开发人员同步数据后，可修改对应的代码问题，再提交评审。
# 如何使用 ?
### 代码评审人员
1. 选中问题代码
2. 在问题代码上点击鼠标右键，选择 '标注问题代码 (codeReviewer)'
3. 在弹出的窗口中填入信息，点击'Add Issue（首次保存时将在项目根路径下生成一个codeReviewer.csv文件）
4. 提交codeReviewer.csv文件至仓库中，即完成代码审核
5. 待开发人员修改完成后，拉取最新的codeReviewer.csv文件，在文件中任一行点击鼠标右键，选择'跳转问题代码 (codeReviewer)'查看文件对比。

### 代码开发人员
1. 拉取仓库中codeReviewer.csv文件，并打开
2. 在显示为 unresolved 的行中，点击鼠标右键，选择 '跳转问题代码 (codeReviewer)'
3. 修改完之后，点击弹出窗口中的'Resolved'按钮
4. 提交codeReviewer.csv文件至仓库中，即完成修改。

--------
### CodeReviewer is a extension for code review.

# How to use ?
### how to review code
1. choose those bad codes
2. right click on the selection
3. select `'codeReviewer'` in the menu
4. click 'Add Issue' button, then the extention will create a file named 'codeReviewer.csv' in the project
5. commit the file (codeReviewer.csv) to repository, so others can solve those problems.
### how to resolve those review code issues
1. open the file 'codeReviewer.csv'
2. right click on a 'unresolved' line
3. select `'codeReviewer'` in the menu
4. click 'Resolved' button after you resolved the issue
5. update the file (codeReviewer.csv) to repository, so code reviewer can check your modification.

## For more information

* [Github](https://github.com/xuebinWu/codeReviewer.git)

**Enjoy!**
